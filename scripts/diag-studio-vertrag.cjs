// diag-studio-vertrag.cjs — DER MANIFEST-VALIDATOR (docs/studio-vertrag.md).
// Die USD-/Schema-Lehre: ein Kern, der den Vertrag verletzt, wird ROT beim
// Andocken — nicht stumm kaputt in der Welt. Statisch + vm (kein Browser, im
// `check`-Gate): jeder registrierte Studio-Kern wird in einem Node-vm-Kontext
// mit THREE-Proxy-Stub geladen (nur die Top-Level-Manifest-Blöcke werden
// ausgeführt, kein Render) und GEGEN den Vertrag validiert:
//   §3 B1 REZEPTE (MUSS): PRESETS-Objekt · jede rezeptId im Namensraum
//       [a-z0-9_-]+ · jedes Rezept trägt kind (string)
//   §3 B2 BUILD (MUSS): buildInstance ist eine Funktion (der Byte-Beweis der
//       Determinismus lebt separat in den frozen Goldens, gate:asset-contract)
//   §3 B3 PLACEMENT (SOLL, wenn vorhanden): scale-Werte > 0 · rarity ∈ (0,1]
//   §3 B4 PARAMS (SOLL, wenn vorhanden): id/lab/min/max/step · min < max
//   §3 B5 LEHREN (SOLL, wenn vorhanden): id + pass-Band [lo,hi]
//   §4 G4.1 must-ignore: der EINE Auto-Register-Chokepoint in anazhRealm.js
//       überspringt unbekannte kinds (continue-Filter), wirft nie
//   §4 G4.3 Version: der Kern deklariert STUDIO_VERTRAG = 1
//   + SELBST-TEST: eine injizierte Verletzung (Rezept ohne kind) wird erkannt
//     — das Gate ist nicht vakuös.
// Eine neue Domäne (vehicle-core/porta-core) trägt sich in CORES ein und wird
// automatisch mitvalidiert (§5 Andock-Sequenz Schritt 5).
//   node scripts/diag-studio-vertrag.cjs
const vm = require("vm");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// Die registrierten Studio-Kerne — N2 (Nervensystem-Plan, „Runtime = Validator"): die Liste
// kommt aus cores.manifest.json, der EINEN Kern-Quelle (Worker-Boot `_ensureAssetFoundry` +
// Platten-Stempel der Transport-Schale `_foundrySchale` + dieser Validator lesen sie). Je Eintrag: file = `vertrag`
// (das Skript, das die Manifest-Blöcke trägt), deps = die übrigen scripts davor (z. B.
// phyto-core vor foundry-core), ns = Namensraum-Kern (Vertrag v1.1 §7, Entscheid E-A): der
// ZWEIT-Kern einer Laufzeit trägt seine Manifest-Blöcke namensgleich unter EINEM Objekt
// statt top-level — löst die const-Kollision mit foundry-core
// (STUDIO_VERTRAG/PORTAL_RENDER_CONFIG/PRESETS) ohne dessen Edit.
const MANIFEST = JSON.parse(fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8"));
const CORES = MANIFEST.map((c) => ({
    file: c.vertrag,
    deps: (Array.isArray(c.scripts) ? c.scripts : []).filter((s) => s !== c.vertrag),
    ns: c.ns || undefined,
}));

const REZEPT_ID = /^[a-z0-9_-]+$/;
// Registrierte + reservierte kinds (§3 B1). Ein UNBEKANNTER kind ist KEIN
// Fehler (must-ignore G4.1) — er wird hier nur informativ gelistet.
const KNOWN_KINDS = [
    "tree",
    "shrub",
    "flower",
    "grass",
    "rock",
    "vehicle",
    "gate",
    "weapon",
    "haus",
    "building",
    "creature",
    // W-A6/W-A7 (v1.1 §8, components-only-Domänen): Klang-Genres + Körper-/Kreatur-Gestalt-Daten.
    "klang",
    "koerper",
    "kreatur",
];

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// Ein absorbierender Proxy: frisst jeden Konstruktor/jede Methode der
// Top-Level-Ausführung (THREE etc.) — nur die DATEN-Blöcke interessieren.
function absorber() {
    const a = new Proxy(function () {}, {
        get: () => a,
        apply: () => a,
        construct: () => a,
    });
    return a;
}

function loadCore(entry) {
    const ctx = vm.createContext({
        THREE: absorber(),
        console: { log() {}, warn() {}, error() {} },
        performance: { now: () => 0 },
    });
    ctx.self = ctx;
    ctx.globalThis = ctx;
    let code = "";
    for (const dep of entry.deps || []) code += fs.readFileSync(path.join(root, dep), "utf8") + "\n;";
    code += fs.readFileSync(path.join(root, entry.file), "utf8");
    if (entry.ns) {
        // v1.1-Namensraum-Kern: dieselben Block-Namen, gelesen unter entry.ns
        // (fehlt der Namensraum ganz, bleibt alles null → B1/B2/G4.3 werden rot).
        code +=
            "\n;__manifest = (function(){" +
            ` var N = typeof ${entry.ns} !== 'undefined' && ${entry.ns} ? ${entry.ns} : {};` +
            " return {" +
            " vertrag: 'STUDIO_VERTRAG' in N ? N.STUDIO_VERTRAG : null," +
            " presets: N.PRESETS || null," +
            " build: N.buildInstance || null," +
            " meshfrei: N.MESHFREI === 1," + // v1.1 §8 — components-only-Kern (B2 N/A)
            " zweit: true," + // W8 — ein Zweit-Kern zählt die Gestalten seiner Rezepte selbst (B2c)
            " cfg: N.PORTAL_RENDER_CONFIG || null," +
            " paramsByKind: N.PARAMS_BY_KIND || null," +
            " arena: N.ARENA || null," + // V18.486 — Gefühls-Blöcke sind Vertrag
            " fahr: N.FAHR || null," +
            " exportDrive: N.exportDrive || null," +
            " verhalten: N.VERHALTEN || null," +
            " lehren: N.LEHREN || null }; })();";
    } else {
        code +=
            "\n;__manifest = {" +
            " vertrag: typeof STUDIO_VERTRAG !== 'undefined' ? STUDIO_VERTRAG : null," +
            " presets: typeof PRESETS !== 'undefined' ? PRESETS : null," +
            " build: typeof buildInstance !== 'undefined' ? buildInstance : null," +
            " meshfrei: typeof MESHFREI !== 'undefined' && MESHFREI === 1," +
            " cfg: typeof PORTAL_RENDER_CONFIG !== 'undefined' ? PORTAL_RENDER_CONFIG : null," +
            " paramsByKind: typeof PARAMS_BY_KIND !== 'undefined' ? PARAMS_BY_KIND : null," +
            " arena: typeof ARENA !== 'undefined' ? ARENA : null," + // V18.486
            " fahr: typeof FAHR !== 'undefined' ? FAHR : null," +
            " exportDrive: typeof exportDrive !== 'undefined' ? exportDrive : null," +
            " verhalten: typeof VERHALTEN !== 'undefined' ? VERHALTEN : null," +
            " lehren: typeof LEHREN !== 'undefined' ? LEHREN : null };";
    }
    vm.runInContext(code, ctx, { timeout: 30000, filename: entry.file });
    return ctx.__manifest;
}

// Reine Validierungs-Funktion (auch der Selbst-Test ruft sie) → Verletzungsliste.
function validateManifest(m) {
    const v = [];
    if (m.vertrag !== 1) v.push(`G4.3: STUDIO_VERTRAG fehlt oder != 1 (ist: ${m.vertrag})`);
    if (!m.presets || typeof m.presets !== "object" || Object.keys(m.presets).length < 1)
        v.push("B1: PRESETS fehlt oder leer");
    else {
        for (const id in m.presets) {
            const r = m.presets[id];
            if (!REZEPT_ID.test(id)) v.push(`B1: rezeptId "${id}" verletzt den Namensraum [a-z0-9_-]+`);
            if (!r || typeof r.kind !== "string" || !r.kind) v.push(`B1: Rezept "${id}" trägt kein kind`);
            if (r && r.s && typeof r.s === "object")
                for (const dk in r.s)
                    if (typeof r.s[dk] !== "number" || !isFinite(r.s[dk]))
                        v.push(`B1: Rezept "${id}" Dial s.${dk} ist keine endliche Zahl`);
        }
    }
    // v1.1 §8 — MESHFREI (components-only): ein nicht-geometrischer Kern (klang/koerper/
    // tetrapoda) deklariert MESHFREI = 1 → B2 ist N/A (er liefert DATEN, keine Gestalt;
    // der build-asset-Dispatch der Brücke überspringt ihn strukturell am typeof-Guard).
    // Ein MESHFREI-Kern, der TROTZDEM buildInstance trägt, ist widersprüchlich → rot.
    if (m.meshfrei) {
        if (typeof m.build === "function") v.push("B2/§8: MESHFREI-Kern trägt buildInstance (widersprüchlich)");
    } else if (typeof m.build !== "function") v.push("B2: buildInstance fehlt (keine Funktion)");
    // B2 (LOD-WURZEL 08.07.) — kindStages: die Stufen-Wahrheit je Art als Daten (SOLL, wenn
    // vorhanden): nicht-leere, aufsteigende Arrays aus Stufen 0..2.
    const lodC = m.cfg && m.cfg.lod;
    if (lodC && lodC.kindStages) {
        for (const k in lodC.kindStages) {
            const s = lodC.kindStages[k];
            if (!Array.isArray(s) || !s.length || s.some((x) => !Number.isInteger(x) || x < 0 || x > 2)) {
                v.push(`B2: lod.kindStages.${k} muss ein nicht-leeres Array aus Stufen 0..2 sein`);
            } else {
                for (let i = 1; i < s.length; i++)
                    if (s[i] <= s[i - 1]) v.push(`B2: lod.kindStages.${k} muss strikt aufsteigend sein`);
            }
        }
    }
    // B2c (04.10.) — DAS BUDGET je Art × Stufe (docs/studio-vertrag.md B2c): trägt ein Kern `lod.budget`, dann
    // VOLLSTÄNDIG — jede Art aus seinen kindStages × jede deklarierte Stufe hat eine Zeile {tris, draws,
    // schatten}; tris ganzzahlig > 0, draws ganzzahlig ≥ 1, schatten = eine deklarierte Stufe der Art oder
    // false; MONOTON — tris fällt je Stufe streng, draws steigt nie; die Karten-Stufe (karte: true) ist die
    // letzte Stufe und wirft nicht. Die DARF-Regler (blattKarte/nadelKarte endlich > 0,
    // deckung ein Band [lo<=1<=hi]) halten ihre Form. Die Konsum-Wand (gebaute Stufen) steht in gate:asset-contract.
    if (lodC && lodC.budget) {
        const ks = lodC.kindStages || {};
        const B = lodC.budget;
        for (const k in B) {
            // B2c (04.10.) — DIE GESTALTEN je Art (Samen-Zahl je Preset, '*' = jede Art ohne Zeile): ganze Zahlen >= 1,
            // die '*'-Zeile ist Pflicht im HAUPT-Kern (die Welt-Varianten-Wahl liest sie für jede Art ohne Zeile).
            // W8 — ein ZWEIT-Kern zählt die Gestalten SEINER Rezepte selbst (das Wirts-16 gehört dem Gesetzbuch):
            // VOLLSTÄNDIG je eigenem Rezept, kein fremdes Rezept, keine '*'-Zeile (die gehört dem Haupt-Kern).
            if (k === "gestalten") {
                const g = B.gestalten;
                if (!g || typeof g !== "object") v.push("B2c: lod.budget.gestalten ist kein Objekt");
                else {
                    if (!m.zweit && !("*" in g)) v.push("B2c: lod.budget.gestalten trägt keine '*'-Zeile");
                    for (const sp in g)
                        if (!(Number.isInteger(g[sp]) && g[sp] >= 1))
                            v.push(`B2c: lod.budget.gestalten.${sp} muss eine ganze Zahl >= 1 sein`);
                    if (m.zweit) {
                        const P = m.presets || {};
                        for (const sp in g)
                            if (!(sp in P)) v.push(`B2c: lod.budget.gestalten.${sp} — kein Rezept dieses Kerns`);
                        for (const id in P)
                            if (!(id in g)) v.push(`B2c: lod.budget.gestalten.${id} fehlt (je Rezept eine Zahl)`);
                    }
                }
                continue;
            }
            if (!ks[k]) {
                v.push(`B2c: lod.budget.${k} — Art ohne kindStages`);
                continue;
            }
            for (const st in B[k]) {
                if (st === "fernform") continue; // die Fernform der Art (unten), keine Stufe
                if (ks[k].indexOf(Number(st)) < 0) v.push(`B2c: lod.budget.${k}[${st}] — keine gelieferte Stufe`);
            }
            // DIE FERNFORM (B2c 04.10.): was die Art jenseits der Nah-Grenze des Wirts ist — "karte" (ihre Karten-Stufe),
            // "gesetz" (ihr Satz im Welt-March) oder "boden" (keine Geometrie). "karte" genau dann, wenn die letzte Stufe
            // Karte ist. PFLICHT je Budget-Art (B2c vollständig): der Host-Leser (_foundryFernForm) liest sie für jede
            // gestreute Art im Zellen-Chokepoint — ein Vertrag ohne sie wäre grün, während der Spielpfad KERN-PFLICHT
            // wirft. Der Schlüssel heißt `fernform`, nie `fern` (der Name der Farn-Art).
            {
                const fern = B[k].fernform;
                const st = Array.isArray(ks[k]) ? ks[k] : [];
                const letzte = st.length ? B[k][st[st.length - 1]] : null;
                const karte = !!(letzte && letzte.karte === true);
                if (fern !== "gesetz" && fern !== "boden" && fern !== "karte")
                    v.push(`B2c: lod.budget.${k}.fernform muss "gesetz", "boden" oder "karte" sein`);
                else if ((fern === "karte") !== karte)
                    v.push(`B2c: lod.budget.${k}.fernform — "karte" genau dann, wenn die letzte Stufe Karte ist`);
            }
        }
        for (const k in ks) {
            const stufen = Array.isArray(ks[k]) ? ks[k] : [];
            let vor = null;
            for (const st of stufen) {
                const z = B[k] && B[k][st];
                if (!z || typeof z !== "object") {
                    v.push(`B2c: lod.budget.${k}[${st}] fehlt (jede deklarierte Stufe trägt eine Zeile)`);
                    vor = null;
                    continue;
                }
                if (!(Number.isInteger(z.tris) && z.tris > 0))
                    v.push(`B2c: lod.budget.${k}[${st}].tris muss eine ganze Zahl > 0 sein`);
                if (!(Number.isInteger(z.draws) && z.draws >= 1))
                    v.push(`B2c: lod.budget.${k}[${st}].draws muss eine ganze Zahl ≥ 1 sein`);
                if (!(z.schatten === false || (Number.isInteger(z.schatten) && stufen.indexOf(z.schatten) >= 0)))
                    v.push(`B2c: lod.budget.${k}[${st}].schatten muss eine deklarierte Stufe oder false sein`);
                // Der Zwilling wirft selbst (der Host zieht ihn als Schatten-Gestalt; ein Kreis 0→1→0 liefe endlos).
                else if (
                    z.schatten !== false &&
                    z.schatten !== st &&
                    !(B[k][z.schatten] && B[k][z.schatten].schatten === z.schatten)
                )
                    v.push(`B2c: lod.budget.${k}[${st}].schatten — der Zwilling (Stufe ${z.schatten}) wirft nicht selbst`);
                if ("karte" in z) {
                    if (z.karte !== true) v.push(`B2c: lod.budget.${k}[${st}].karte ist nur als true erlaubt`);
                    else if (st !== stufen[stufen.length - 1] || z.schatten !== false)
                        v.push(
                            `B2c: lod.budget.${k}[${st}].karte — nur die letzte Stufe ist Karte, und sie wirft nicht`
                        );
                }
                for (const f of ["blattKarte", "nadelKarte"])
                    if (f in z && !(typeof z[f] === "number" && z[f] > 0 && isFinite(z[f])))
                        v.push(`B2c: lod.budget.${k}[${st}].${f} muss endlich > 0 sein`);
                // W5: der Anteil der gewachsenen Blattstellen je Kronen-Art, die eine Karte/Strähne tragen — (0, 1].
                if ("dichte" in z) {
                    const d = z.dichte;
                    if (!d || typeof d !== "object" || !Object.keys(d).length)
                        v.push(`B2c: lod.budget.${k}[${st}].dichte muss ein Objekt je Kronen-Art sein`);
                    else
                        for (const art of Object.keys(d))
                            if (!(typeof d[art] === "number" && d[art] > 0 && d[art] <= 1))
                                v.push(`B2c: lod.budget.${k}[${st}].dichte.${art} muss in (0, 1] liegen`);
                }
                // S7: die Regler der Nahkrone — rinde {ast, reisig} in trunkR (0 < reisig < ast < 1), straehne {teile
                // ganz >= 1, breite > 0} in Blattlaengen, boden in [0, 1) Baumhoehen.
                if ("rinde" in z) {
                    const r = z.rinde;
                    if (!r || !(r.reisig > 0 && r.reisig < r.ast && r.ast < 1))
                        v.push(`B2c: lod.budget.${k}[${st}].rinde muss 0 < reisig < ast < 1 tragen`);
                }
                if ("straehne" in z) {
                    const r = z.straehne;
                    if (!r || !(Number.isInteger(r.teile) && r.teile >= 1) || !(r.breite > 0 && isFinite(r.breite)))
                        v.push(`B2c: lod.budget.${k}[${st}].straehne muss teile (ganz >= 1) und breite (> 0) tragen`);
                }
                if ("boden" in z && !(typeof z.boden === "number" && z.boden >= 0 && z.boden < 1))
                    v.push(`B2c: lod.budget.${k}[${st}].boden muss in [0, 1) liegen`);
                // W6 (05.10.): die Bahn der L1-Aeste — ein Ring faellt, wenn Mitte und Radius hoechstens so viele
                // Baumhoehen von der Strecke seiner Nachbarn abweichen (foundry-core __ringBahn): 0 < ringToleranz < 0,01.
                if ("ringToleranz" in z && !(typeof z.ringToleranz === "number" && z.ringToleranz > 0 && z.ringToleranz < 0.01))
                    v.push(`B2c: lod.budget.${k}[${st}].ringToleranz muss in (0, 0,01) Baumhoehen liegen`);
                // W6 (05.10.): der Wurf-Teil — Straenge ab durchmesserM Welt-Durchmesser werfen (der Kaskaden-Texel k0);
                // nur eine Stufe, die selbst wirft, kann einen Wurf-Teil nennen.
                if ("wurf" in z) {
                    const w = z.wurf;
                    if (!w || !(typeof w.durchmesserM === "number" && w.durchmesserM > 0 && isFinite(w.durchmesserM)))
                        v.push(`B2c: lod.budget.${k}[${st}].wurf.durchmesserM muss endlich > 0 sein`);
                    else if (z.schatten !== Number(st))
                        v.push(`B2c: lod.budget.${k}[${st}].wurf — nur eine Stufe, die selbst wirft, nennt einen Wurf-Teil`);
                }
                // Welle 5 (Integration 05.10.): das Reisig des Strauchs — schnitt (Radius-Schnitt der Stufe in trunkR:
                // duennere Straenge fallen) < rute (in trunkR: darunter Vierkant-Roehre auf jedem 3. Ring) < 1.
                if (("schnitt" in z || "rute" in z) && !(z.schnitt > 0 && z.rute > z.schnitt && z.rute < 1))
                    v.push(`B2c: lod.budget.${k}[${st}] muss 0 < schnitt < rute < 1 tragen`);
                // W8 — `band` = das Profi-Band-Ziel der Stufe, solange die gebaute Huelle (`tris`) darueber liegt:
                // ganze Zahl > 0 und < tris (erreicht die Stufe das Band, faellt das Feld und tris IST das Band).
                if ("band" in z && !(Number.isInteger(z.band) && z.band > 0 && Number.isInteger(z.tris) && z.band < z.tris))
                    v.push(`B2c: lod.budget.${k}[${st}].band muss eine ganze Zahl > 0 und < tris sein`);
                if ("deckung" in z) {
                    const d = z.deckung;
                    if (!Array.isArray(d) || d.length !== 2 || !(d[0] > 0 && d[0] <= 1 && d[1] >= 1 && isFinite(d[1])))
                        v.push(`B2c: lod.budget.${k}[${st}].deckung muss ein Band [lo<=1<=hi] sein`);
                }
                if (vor) {
                    if (!(z.tris < vor.z.tris))
                        v.push(
                            `B2c: lod.budget.${k} — tris fällt nicht streng (${vor.st}: ${vor.z.tris} → ${st}: ${z.tris})`
                        );
                    if (z.draws > vor.z.draws)
                        v.push(`B2c: lod.budget.${k} — draws steigt (${vor.st}: ${vor.z.draws} → ${st}: ${z.draws})`);
                }
                vor = { st, z };
            }
        }
    }
    const pl = m.cfg && m.cfg.placement;
    if (pl) {
        if (pl.scale)
            for (const k in pl.scale)
                if (!(typeof pl.scale[k] === "number" && pl.scale[k] > 0))
                    v.push(`B3: placement.scale.${k} muss Zahl > 0 sein`);
        if (pl.rarity)
            for (const k in pl.rarity)
                if (!(typeof pl.rarity[k] === "number" && pl.rarity[k] > 0 && pl.rarity[k] <= 1))
                    v.push(`B3: placement.rarity.${k} muss in (0,1] liegen`);
        // B3b (Waldboden 04.10.) — DAS BODEN-GESETZ (placement.boden): jede Zeile ist eine Studio-Art DIESES Kerns,
        // deren kind Stufen UND für jede Stufe eine Budget-Zeile trägt (die Nah-Streu der Welt baut sie über die
        // Foundry) und die eine eigene Gestalten-Zeile hat (nie '*' = 16); ring ∈ {nah, wald}, dichte > 0,
        // skala [min ≤ max] > 0, jedes Band ein Trapez [a ≤ b ≤ c ≤ d].
        if (pl.boden) {
            const L = (m.cfg && m.cfg.lod) || {};
            const ksB = L.kindStages || {};
            const BB = L.budget || {};
            for (const id in pl.boden) {
                const z = pl.boden[id] || {};
                const pre = m.presets && m.presets[id];
                if (!pre) {
                    v.push(`B3b: placement.boden.${id} — kein Preset dieses Kerns`);
                    continue;
                }
                const st = ksB[pre.kind];
                if (!Array.isArray(st) || !st.length)
                    v.push(`B3b: placement.boden.${id} — kind ${pre.kind} ohne kindStages`);
                else
                    for (const sv of st)
                        if (!(BB[pre.kind] && BB[pre.kind][sv]))
                            v.push(`B3b: placement.boden.${id} — Budget ${pre.kind}[${sv}] fehlt`);
                if (!(BB.gestalten && Number.isInteger(BB.gestalten[id]) && BB.gestalten[id] >= 1))
                    v.push(`B3b: placement.boden.${id} — keine eigene Gestalten-Zeile`);
                if (z.ring !== "nah" && z.ring !== "wald") v.push(`B3b: placement.boden.${id}.ring muss nah|wald sein`);
                if (!(typeof z.dichte === "number" && z.dichte > 0))
                    v.push(`B3b: placement.boden.${id}.dichte muss Zahl > 0 sein`);
                if (z.weite !== undefined && !(typeof z.weite === "number" && z.weite > 0))
                    v.push(`B3b: placement.boden.${id}.weite muss Zahl > 0 sein`);
                if (!Array.isArray(z.skala) || z.skala.length !== 2 || !(z.skala[0] > 0 && z.skala[0] <= z.skala[1]))
                    v.push(`B3b: placement.boden.${id}.skala muss [min ≤ max] > 0 sein`);
                for (const band of ["licht", "feucht", "ufer", "fels"]) {
                    const t = z[band];
                    if (t === undefined) continue;
                    if (!Array.isArray(t) || t.length !== 4 || !(t[0] <= t[1] && t[1] <= t[2] && t[2] <= t[3]))
                        v.push(`B3b: placement.boden.${id}.${band} muss ein Trapez [a ≤ b ≤ c ≤ d] sein`);
                }
            }
        }
    }
    // SYNERGIE-WELLE (v1.2) — DIE EINE B4-FORM: die Regler-Tabellen reisen als MAP
    // PARAMS_BY_KIND ({ <kind>: rows }) — auch Ein-Kind-Kerne. Das flache PARAMS ist
    // GEFALLEN (ein Kern, der es noch truege, wuerde schlicht nicht validiert —
    // must-ignore; die Werkstatt saehe keine Regler → der Bau-Fehler wird sichtbar).
    if (m.paramsByKind) {
        if (typeof m.paramsByKind !== "object" || Array.isArray(m.paramsByKind))
            v.push("B4: PARAMS_BY_KIND ist keine Map { kind: rows[] }");
        else
            for (const kind in m.paramsByKind) {
                const rows = m.paramsByKind[kind];
                if (!Array.isArray(rows)) {
                    v.push(`B4: PARAMS_BY_KIND.${kind} ist kein Array`);
                    continue;
                }
                for (const p of rows) {
                    if (!p || typeof p.id !== "string" || typeof p.lab !== "string")
                        v.push(`B4: PARAMS_BY_KIND.${kind}-Eintrag ohne id/lab`);
                    else if (!(typeof p.min === "number" && typeof p.max === "number" && p.min < p.max))
                        v.push(`B4: PARAMS_BY_KIND.${kind} "${p.id}" min/max ungültig`);
                }
            }
    }
    if (m.lehren) {
        if (!Array.isArray(m.lehren)) v.push("B5: LEHREN ist kein Array");
        else
            for (const l of m.lehren) {
                if (!l || typeof l.id !== "string") v.push("B5: LEHREN-Eintrag ohne id");
                else if (!(Array.isArray(l.pass) && l.pass.length === 2 && l.pass[0] < l.pass[1]))
                    v.push(`B5: Lehre "${l.id}" pass-Band [lo,hi] ungültig`);
            }
    }
    // V18.486 — DIE GEFÜHLS-BLÖCKE (V18.483/485) sind VERTRAG, nicht mehr nur
    // must-ignore-„darf": trägt ein Kern sie, MUSS die Struktur stimmen
    // (SOLL-Validierung; die PFLICHT je Kern prüft der Haupt-Lauf).
    const fxB =
        m.presets && m.presets.mensch && m.presets.mensch.fx && m.presets.mensch.fx.bewegung
            ? m.presets.mensch.fx.bewegung
            : null;
    if (fxB) {
        const s = fxB.schwimmen;
        if (
            !s ||
            !Number.isFinite(s.tauchV) ||
            !Number.isFinite(s.drag) ||
            !s.lean ||
            !s.pose ||
            !Number.isFinite(s.ausdauerProS)
        )
            v.push("§8.2+ fx.bewegung.schwimmen unvollständig (tauchV/drag/lean/pose/ausdauerProS)");
        const p = fxB.parkour;
        if (!p || !Number.isFinite(p.kletterV) || !Number.isFinite(p.wandAbstoss) || !Number.isFinite(p.slideTempoMul))
            v.push("§8.2+ fx.bewegung.parkour unvollständig (kletterV/wandAbstoss/slideTempoMul)");
        else if (!p.slidePose || !Number.isFinite(p.slidePose.lehne))
            v.push("§8.2+ parkour.slidePose unvollständig (lehne fehlt)");
        // SPIEGEL-ZENSUS 17.07. (BEWEGUNG-Rest) — die gereisten Boden-Blöcke
        // sind Vertrag (dieselben Felder, die die _bewegungsBlock-Wand des
        // Wirts prüft: EIN fehlendes Feld → ganz Fallback, nie Misch-Gesetz).
        if (p && Number.isFinite(p.kletterV) && !Number.isFinite(p.kontaktFrischeSec))
            v.push("§8.2+ parkour.kontaktFrischeSec fehlt (das EINE Wandkontakt-Fenster)");
        const lf = fxB.luft;
        if (!lf || !Number.isFinite(lf.kAcc) || !Number.isFinite(lf.kAccLuft) || !Number.isFinite(lf.kBrakeLuft))
            v.push("§8.2+ fx.bewegung.luft unvollständig (kAcc/kAccLuft/kBrake/kBrakeLuft)");
        const spg = fxB.sprung;
        if (!spg || !Number.isFinite(spg.coyoteSec) || !Number.isFinite(spg.bufferSec))
            v.push("§8.2+ fx.bewegung.sprung unvollständig (coyoteSec/bufferSec)");
        if (!fxB.schritt || !Number.isFinite(fxB.schritt.kalib))
            v.push("§8.2+ fx.bewegung.schritt.kalib fehlt (Gang-Kalibrierung)");
        if (!Number.isFinite(fxB.aktionAusdauer))
            v.push("§8.2+ fx.bewegung.aktionAusdauer fehlt (Maus-Arm-Aktion)");
    }
    if (m.arena) {
        const a = m.arena;
        // SPIEGEL-ZENSUS 17.07. — die gereisten Zensus-Zeilen sind Vertrag:
        // je Block deckt EIN Wander-Feld mit (windupFrac = Hieb-Geometrie,
        // stossCap = Knockback-Wucht, muendungM = Pfeil-Flug — dieselben
        // Felder, die die _arenaGesetz-Gültigkeits-Wand des Wirts prüft).
        if (
            !a.schwung ||
            !Number.isFinite(a.schwung.dauerProSqrtI) ||
            !Number.isFinite(a.schwung.windupFrac) ||
            !a.gefuehl ||
            !Number.isFinite(a.gefuehl.keRefJ) ||
            !Number.isFinite(a.gefuehl.stossCap) ||
            !a.bogen ||
            !Number.isFinite(a.bogen.mArrow) ||
            !Number.isFinite(a.bogen.muendungM)
        )
            v.push(
                "§B6+ ARENA unvollständig (schwung.dauerProSqrtI/windupFrac · gefuehl.keRefJ/stossCap · bogen.mArrow/muendungM)"
            );
    }
    if (m.fahr) {
        const L = m.fahr.lenkung;
        if (
            !L ||
            !Number.isFinite(L.sfK) ||
            !Number.isFinite(L.gripK) ||
            !Number.isFinite(L.driftGripMul) ||
            !Number.isFinite(L.kehrV)
        )
            v.push("§B6+ FAHR.lenkung unvollständig (sfK/gripK/driftGripMul/kehrV)");
    }
    if (m.verhalten) {
        const V = m.verhalten;
        const aOk = V.aktionen && typeof V.aktionen === "object" && Object.keys(V.aktionen).length >= 8;
        // SCHLUSS-WELLE 17.07.: "schwellen" ist die Schwellen-DATEN-Zeile der
        // Stimmungs-Tabelle (keine Stimmung) — die Zeilen-Prüfung überspringt sie.
        const sOk =
            V.stimmung &&
            typeof V.stimmung === "object" &&
            Object.entries(V.stimmung).every(
                ([sk, st]) =>
                    sk === "schwellen" ||
                    (st && Array.isArray(st.aktionen) && Array.isArray(st.alle) && st.alle.length === 2)
            );
        if (!aOk || !sOk) v.push("§B6+ VERHALTEN unvollständig (aktionen ≥8 / stimmung{aktionen,alle[2]})");
        else {
            for (const k in V.stimmung) {
                if (k === "schwellen") continue;
                for (const an of V.stimmung[k].aktionen)
                    if (!V.aktionen[an]) v.push(`§B6+ VERHALTEN: Stimmung "${k}" nennt unbekannte Aktion "${an}"`);
            }
        }
        // SPIEGEL-ZENSUS 17.07. — die KREATUR-SEELE ist Vertrag: die vier
        // gereisten Verhaltens-Blöcke (jagd/furcht/temperament/wandern) —
        // dieselben Felder, die die _verhaltenGesetz-Gültigkeits-Wand des
        // Wirts prüft (je Block EIN Wander-Feld; alter Kern → ganz byte-alt).
        const seeleOk =
            V.jagd &&
            Number.isFinite(V.jagd.strikeRange) &&
            V.furcht &&
            Number.isFinite(V.furcht.fleeThreshold) &&
            V.temperament &&
            V.temperament.signaturen &&
            V.temperament.profile &&
            Number.isFinite(V.temperament.floor) &&
            V.wandern &&
            Number.isFinite(V.wandern.leashBaseM) &&
            // SCHLUSS-WELLE 17.07. — die neun heimgekehrten Blöcke sind Vertrag
            // (dieselben Felder, die die _verhaltenGesetz-Wand des Wirts prüft):
            Number.isFinite(V.jagd.pirschStoppM) &&
            Number.isFinite(V.furcht.neugierStoppM) &&
            V.stimmung &&
            V.stimmung.schwellen &&
            Number.isFinite(V.stimmung.schwellen.weideDiet) &&
            V.freude &&
            Number.isFinite(V.freude.tempoMul) &&
            V.sprung &&
            Number.isFinite(V.sprung.impulsProM) &&
            Array.isArray(V.groessen) &&
            V.groessen.length >= 2 &&
            V.separation &&
            Number.isFinite(V.separation.radiusBaseM) &&
            V.aufgaben &&
            Number.isFinite(V.aufgaben.followTempo) &&
            V.herde &&
            Number.isFinite(V.herde.gewicht) &&
            V.wasser &&
            Number.isFinite(V.wasser.uferBias);
        if (!seeleOk)
            v.push(
                "§B6+ VERHALTEN unvollständig (KREATUR-SEELE: jagd.strikeRange/pirschStoppM · furcht.fleeThreshold/neugierStoppM · temperament{signaturen,profile,floor} · wandern.leashBaseM · stimmung.schwellen · freude/sprung/groessen/separation/aufgaben/herde/wasser)"
            );
    }
    return v;
}

(function main() {
    console.log("=== DER STUDIO-VERTRAG — Manifest-Validator (docs/studio-vertrag.md) ===");

    // §0 — das Vertrags-Dokument selbst steht + trägt die sechs Blöcke.
    const docPath = path.join(root, "docs/studio-vertrag.md");
    const doc = fs.existsSync(docPath) ? fs.readFileSync(docPath, "utf8") : "";
    check("Vertrag existiert (docs/studio-vertrag.md)", doc.length > 0);
    check(
        "Vertrag trägt die sechs Blöcke B1–B6 + die Empfänger-Gesetze",
        [
            "B1 — REZEPTE",
            "B2 — BUILD",
            "B3 — PLACEMENT",
            "B4 — PARAMS",
            "B5 — LEHREN",
            "B6 — VERHALTEN",
            "must-ignore",
            "fail-closed",
            "Ü1 — LICHT-INTENSITÄTEN × π",
            "Ü2 — AUTOREN-FARBEN RAW-ALS-LINEAR",
        ].every((s) => doc.includes(s))
    );

    // N2 — das Kern-Manifest selbst ist gültig (die eine Quelle, aus der CORES abgeleitet ist).
    check(
        "cores.manifest.json ist ein gültiger Kern-Satz (id + scripts + vertrag je Eintrag)",
        Array.isArray(MANIFEST) &&
            MANIFEST.length >= 1 &&
            MANIFEST.every(
                (c) =>
                    c &&
                    typeof c.id === "string" &&
                    Array.isArray(c.scripts) &&
                    c.scripts.length >= 1 &&
                    typeof c.vertrag === "string" &&
                    c.scripts.includes(c.vertrag)
            ),
        `${MANIFEST.length} Kern(e): ${MANIFEST.map((c) => c && c.id).join(", ")}`
    );

    // §3/§4 — jeder registrierte Kern erfüllt den Vertrag.
    const budgets = {}; // B2c: lod.budget je Kern (Datei → Budget), für die Karten-Linse unten
    const ohneBudget = []; // W8: ein Kern mit Gestalt (kindStages) ohne Budget ist ein Vertrags-Bruch
    const ohneGestalten = []; // W8: ein Zweit-Kern mit Gestalt ohne lod.budget.gestalten ebenso
    for (const entry of CORES) {
        console.log(`\n--- Kern: ${entry.file} ---`);
        let m = null;
        try {
            m = loadCore(entry);
        } catch (e) {
            check(`${entry.file}: lädt im vm (THREE-Stub)`, false, (e && e.message) || String(e));
            continue;
        }
        const viol = validateManifest(m);
        const lodM = m.cfg && m.cfg.lod;
        if (lodM && lodM.budget) budgets[entry.file] = { budget: lodM.budget, kindStages: lodM.kindStages || {} };
        else if (lodM && lodM.kindStages) ohneBudget.push(entry.file);
        if (entry.ns && lodM && lodM.kindStages && !(lodM.budget && lodM.budget.gestalten))
            ohneGestalten.push(entry.file);
        check(`${entry.file}: 0 Vertrags-Verletzungen`, viol.length === 0, viol[0] || "");
        for (let i = 1; i < viol.length; i++) console.log(`      ↳ ${viol[i]}`);
        const n = m.presets ? Object.keys(m.presets).length : 0;
        const kinds = m.presets ? [...new Set(Object.values(m.presets).map((r) => r && r.kind))] : [];
        const unknown = kinds.filter((k) => !KNOWN_KINDS.includes(k));
        console.log(
            `      ${n} Rezepte · kinds: ${kinds.join(", ")}${unknown.length ? ` · unbekannt (must-ignore): ${unknown.join(", ")}` : ""}`
        );
        check(
            `${entry.file}: B1+B2 MUSS erfüllt (Rezepte + build | MESHFREI §8)`,
            n >= 1 && (typeof m.build === "function" || m.meshfrei === true)
        );
    }

    // §4b Ü1 — die Licht-Übersetzungs-Konstante existiert im Code (die Regel ist Struktur).
    check(
        "Ü1: AnazhRealm.LEGACY_LICHT = Math.PI existiert (r155-Migrations-Regel)",
        /LEGACY_LICHT\s*=\s*Math\.PI/.test(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"))
    );

    // §4 G4.1 — must-ignore am EINEN Auto-Register-Chokepoint: unbekannte
    // kinds werden ÜBERSPRUNGEN (continue-Filter), nie geworfen. Kommentare
    // gestrippt (die V18.267-Falle).
    const realm = fs
        .readFileSync(path.join(root, "anazhRealm.js"), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "");
    const reg = realm.match(/_foundryAutoRegisterSpecies\(book\)\s*\{[\s\S]{0,2500}/);
    check(
        // N1-migriert (V9.56-i): der kind-Filter ist die KIND_POLICY-Tabelle — ein
        // unbekannter kind hat keine Policy-Zeile und wird uebersprungen (must-ignore).
        "G4.1: der Auto-Register-Chokepoint filtert per Policy (must-ignore, wirft nie)",
        !!reg && /KP\[rec\.kind\]/.test(reg[0]) && /if \(!pol\) continue/.test(reg[0])
    );

    // W8 — JEDER Kern mit Gestalt trägt sein Budget (B2c), jeder Zweit-Kern seine Gestalten je Rezept: die
    // Studio-Übertragung ist kein offener Rest mehr. Klang trägt keine Gestalt (keine kindStages) und kein Budget.
    check(
        "B2c: jeder Kern mit Gestalt (kindStages) trägt lod.budget",
        ohneBudget.length === 0 && Object.keys(budgets).length >= 7,
        ohneBudget.length ? "Budget fehlt: " + ohneBudget.join(", ") : Object.keys(budgets).join(", ")
    );
    check(
        "B2c: jeder Zweit-Kern mit Gestalt zählt seine Gestalten (lod.budget.gestalten — Gesetzbuch statt Wirts-16)",
        ohneGestalten.length === 0,
        ohneGestalten.join(", ")
    );

    // B2c — DIE KARTEN-LINSE: die Karten-Stufe des Studios (budget[kind][letzte].karte) und die Fernstufe des
    // Hosts (KIND_POLICY[kind].impostor → `_foundryBuildImpostorFlat`) sagen dasselbe — je Art, die ein Budget
    // trägt. Weichen sie ab, misst die Konsum-Wand eine Stufe, die nie ins Bild kommt (oder umgekehrt). Eine
    // EINSTUFIGE Art (nur Stufe 0 — Tor, Fahrzeug) liefert keine Karten-Stufe: ihre Fernkarte backt der Wirt aus
    // Stufe 0 (Studio-Vertrag B2, „L2-Auto-Impostor ist Sache des Wirts").
    const kartenUrteil = (src, bud) => {
        const kp = src.match(/AnazhRealm\.KIND_POLICY = Object\.freeze\(\{([\s\S]*?)\n\}\);/);
        if (!kp) return ["KIND_POLICY im Stamm nicht gefunden"];
        const f = [];
        for (const datei in bud) {
            const { budget, kindStages } = bud[datei];
            for (const k in kindStages) {
                const st = kindStages[k];
                const letzte = budget[k] && budget[k][st[st.length - 1]];
                const karte = !!(letzte && letzte.karte === true);
                const imp = new RegExp("\\n\\s*" + k + ": Object\\.freeze\\(\\{[^}]*impostor: true").test(kp[1]);
                if (karte ? !imp : imp && st.length > 1)
                    f.push(
                        `${k}: Studio-Karte ${karte ? "ja" : "nein"} ≠ Host-Impostor ${imp ? "ja" : "nein"} (${datei})`
                    );
            }
        }
        return f;
    };
    const kU = kartenUrteil(realm, budgets);
    check(
        "B2c KARTEN-LINSE: budget[kind][letzte].karte ⇔ KIND_POLICY[kind].impostor (je Art mit Budget)",
        Object.keys(budgets).length >= 1 && kU.length === 0,
        kU[0] || Object.keys(budgets).join(", ")
    );
    const kSelbst = kartenUrteil(
        realm.replace(/\n(\s*)shrub: Object\.freeze\(\{ impostor: true \}\)/, "\n$1shrub: Object.freeze({})"),
        budgets
    );
    check(
        "SELBST-TEST: ein Host ohne Strauch-Impostor feuert die Karten-Linse",
        kSelbst.some((s) => s.startsWith("shrub:"))
    );
    console.log(`      Budget (B2c) trägt: ${Object.keys(budgets).join(", ") || "—"}`);

    // W8 — DAS BUDGET-GESETZ HAT SEINE LESER (Quell-Proben, Kommentare gestrippt): die Brücke faltet jede Zweit-Kern-
    // Gestalt am Ausgang (`__replyBuildAsset` → phyto-core budgetErzwingen auf der Zeile des EIGENEN Kerns), der
    // Sync-Guss des Wirts-Ofens (Tier UND Mensch) verlässt das Studio an derselben Stelle (`_ofenBudget`), und der
    // Material-Cache des Wirts keyt mit DERSELBEN Stoff-Identität (budgetStoff), mit der das Gesetz zählt.
    const phytoNC = fs
        .readFileSync(path.join(root, "worlds/terrain/phytogenesis.js"), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "");
    const leserUrteil = (realmSrc, phytoSrc) => {
        const f = [];
        const reply = phytoSrc.match(/function __replyBuildAsset\(msg\) \{[\s\S]*?\n {4}\}\n/);
        if (!reply || !/if \(isZweitKern\) \{[\s\S]*?budgetZeile\(zweit\.kern\.PORTAL_RENDER_CONFIG[\s\S]*?budgetErzwingen\(meshes/.test(reply[0]))
            f.push("Brücke: __replyBuildAsset faltet die Zweit-Kern-Gestalt nicht (budgetErzwingen)");
        const ofen = realmSrc.match(/\n {4}_ofenBudget\(core, kind, lod, eintraege, name\) \{[\s\S]*?\n {4}\}/);
        if (!ofen || !/budgetErzwingen\(eintraege/.test(ofen[0])) f.push("Wirt: _ofenBudget faltet nicht");
        const ofenRufe = (realmSrc.match(/this\._ofenAssembleAsset\(this\._ofenBudget\(core, "(kreatur|koerper)"/g) || []).length;
        if (ofenRufe !== 2) f.push(`Wirt: der Sync-Guss läuft ${ofenRufe}/2 mal durch _ofenBudget (Tier + Mensch)`);
        if (!/const key =\s*globalThis\.__phytoCore\.budgetStoff\(kind, mp\)/.test(realmSrc))
            f.push("Wirt: _foundryTreeMaterial keyt nicht mit budgetStoff");
        // Integration W8 — DIE SEH-KLASSE REIST: beide Extraktoren (Brücke + Ofen) reichen den Gesetzbuch-Stempel
        // `material.userData.__seh` als `mat.seh` weiter — ohne ihn kennt das Gesetz keine Klasse und jede
        // Zweit-Kern-Stufe bräche (gate:asset-contract misst das an jedem Fall).
        const ex = phytoSrc.match(/function __extractAssetMesh\(mesh, zweitKern\) \{[\s\S]*?\n {4}\}\n/);
        if (!ex || !/out\.mat\.seh = mat\.userData\.__seh/.test(ex[0]))
            f.push("Brücke: __extractAssetMesh reicht die Seh-Klasse nicht (mat.seh)");
        const oe = realmSrc.match(/\n {4}_ofenMeshEintragAusThree\(mesh\) \{[\s\S]*?\n {4}\}/);
        if (!oe || !/out\.mat\.seh = mat\.userData\.__seh/.test(oe[0]))
            f.push("Wirt: _ofenMeshEintragAusThree reicht die Seh-Klasse nicht (mat.seh)");
        // Integration W8 (Prüfer W8 (c)) — DIE SIPPE IST EINE REGEL: die Konversion stempelt phyto-core `budgetSippe` ans
        // Mesh, der Flatten trägt sie aufs Leaf, Flatten und Starr-Bindung gruppieren nach ihr — keine eigene
        // Attribut-Signatur im Wirt (gate:sippen-wirt misst Gesetz gegen Leaves im Spiel).
        const bm = realmSrc.match(/\n {4}_foundryBuildMesh\(m\) \{[\s\S]*?\n {4}\}/);
        if (!bm || !/mesh\.userData\.__sippe = globalThis\.__phytoCore\.budgetSippe\(m\)/.test(bm[0]))
            f.push("Wirt: _foundryBuildMesh stempelt die Sippe nicht (budgetSippe)");
        if (!/sippe: child\.userData \? child\.userData\.__sippe/.test(realmSrc))
            f.push("Wirt: der Flatten trägt die Sippe nicht aufs Leaf");
        const fv = realmSrc.match(/\n {4}_foundryFlatVerschmelzen\(group, leaves\) \{[\s\S]*?\n {4}\}/);
        if (!fv || !/lf\.sippe \? lf\.sippe \+/.test(fv[0]) || /Object\.keys\(g\.attributes\)\s*\.sort\(\)/.test(fv[0]))
            f.push("Wirt: _foundryFlatVerschmelzen gruppiert nicht nach der Sippe des Gesetzes");
        const sb = realmSrc.match(/\n {4}static _ofenStarrBinden\(root\) \{[\s\S]*?\n {4}\}/);
        if (
            !sb ||
            !/n\.userData \? n\.userData\.__sippe/.test(sb[0]) ||
            /Object\.keys\(g\.attributes\)\s*\.sort\(\)/.test(sb[0])
        )
            f.push("Wirt: _ofenStarrBinden bindet nicht nach der Sippe des Gesetzes");
        return f;
    };
    const lU = leserUrteil(realm, phytoNC);
    check(
        "W8: das Budget-Gesetz hat seine Leser (Brücke · Ofen-Sync-Guss · Material-Schlüssel · Seh-Klasse beider Extraktoren · Sippe in Flatten und Ofen)",
        lU.length === 0,
        lU[0] || ""
    );
    const lSelbst = leserUrteil(realm.replace("budgetErzwingen(eintraege", "budgetSippen(eintraege"), phytoNC);
    check("SELBST-TEST: ein Ofen ohne Faltung feuert die Leser-Probe", lSelbst.some((s) => s.includes("_ofenBudget")));
    const sehAus = realm.replace("out.mat.seh = mat.userData.__seh", "out.mat.sehX = mat.userData.__seh");
    check(
        "SELBST-TEST: ein Ofen-Extraktor ohne Seh-Klasse feuert die Leser-Probe",
        sehAus !== realm && leserUrteil(sehAus, phytoNC).some((s) => s.includes("Seh-Klasse"))
    );
    const sippeAus = realm.replace(
        "mesh.userData.__sippe = globalThis.__phytoCore.budgetSippe(m)",
        "mesh.userData.__sippe = null"
    );
    check(
        "SELBST-TEST: eine Konversion ohne Sippen-Stempel feuert die Leser-Probe",
        sippeAus !== realm && leserUrteil(sippeAus, phytoNC).some((s) => s.includes("stempelt die Sippe"))
    );

    // V18.486 — DIE PFLICHT JE KERN: die Gefühls-Blöcke der V18.483/485-Wellen
    // sind Vertrag. Fehlt der Block im tragenden Kern, ist das ROT (vorher war
    // alles nur must-ignore-„darf" — unbewacht, konnte still fallen).
    const pflicht = {
        "koerper-core.js": (m) =>
            !!(
                m.presets &&
                m.presets.mensch &&
                m.presets.mensch.fx &&
                m.presets.mensch.fx.bewegung &&
                m.presets.mensch.fx.bewegung.schwimmen &&
                m.presets.mensch.fx.bewegung.parkour &&
                m.presets.mensch.fx.bewegung.parkour.slidePose
            ),
        "schmiede-core.js": (m) => !!(m.arena && m.arena.schwung && m.arena.gefuehl && m.arena.bogen),
        "vehicle-core.js": (m) => !!(m.fahr && m.fahr.lenkung && typeof m.exportDrive === "function"),
        "tetrapoda-core.js": (m) =>
            !!(
                m.verhalten &&
                m.verhalten.aktionen &&
                m.verhalten.stimmung &&
                m.verhalten.jagd &&
                m.verhalten.furcht &&
                m.verhalten.temperament &&
                m.verhalten.wandern &&
                // SCHLUSS-WELLE 17.07. — die neun heimgekehrten Blöcke:
                m.verhalten.stimmung.schwellen &&
                m.verhalten.freude &&
                m.verhalten.sprung &&
                m.verhalten.groessen &&
                m.verhalten.separation &&
                m.verhalten.aufgaben &&
                m.verhalten.herde &&
                m.verhalten.wasser
            ),
    };
    for (const entry of CORES) {
        if (!pflicht[entry.file]) continue;
        let m = null;
        try {
            m = loadCore(entry);
        } catch (_e) {}
        check(
            `PFLICHT ${entry.file}: trägt seinen Gefühls-Block (fx.bewegung/ARENA/FAHR.lenkung/VERHALTEN)`,
            !!m && pflicht[entry.file](m)
        );
    }
    // KERN-PFLICHT 17.07. — DIE ZWILLINGS-ABSENZ-WAND: die Schwimm- und
    // Kreatur-Seelen-PARITÄTS-Wände sind GEGENSTANDSLOS — die Stamm-Zahlen-
    // Zwillinge sind GEFALLEN (die Kerne sind Pflicht, alle Leser fail-closed:
    // _kernPflichtBruch statt stiller byte-alter Ersatz-Welt). Diese Wand hält
    // sie draußen: kehrt auch nur EIN gefallener Zwilling als echte Zeilen-
    // Anfangs-Zuweisung in den Stamm zurück, wird das Gate rot (Kommentare
    // zitieren straflos — die Wand matcht nur ^AnazhRealm.<Name> =).
    const ZWILLINGE = [
        "SCHWIMM_FALLBACK",
        "LUFT_FALLBACK",
        "SPRUNG_FALLBACK",
        "SCHRITT_FALLBACK",
        "VERHALTEN_FALLBACK",
        "ARENA_FALLBACK",
        "_SOUL_SWIM_LEAN_FALLBACK",
        "SWING_LAWS",
        "BOGEN_LAWS",
        "COMBAT_REACH_M",
        "MOUSE_ACTION_STAMINA_COST",
        "CREATURE_HUNT",
        "CREATURE_NATURE",
        "TEMPERAMENT_SIGNATURES",
        "TEMPERAMENT_FLOOR",
        "TEMPERAMENT_PROFILES",
        "CREATURE_CHARAKTER",
        // SCHLUSS-WELLE 17.07. — der Herden-Abstand wohnt im tetrapoda-
        // Gesetzbuch (VERHALTEN.separation), der Stamm-Zwilling ist gefallen:
        "CREATURE_SEPARATION",
        // ZWILLINGS-ABSCHIED 19.07. — der Tür-Öffnungswinkel wohnt im
        // porta-Gesetzbuch (TUER_GESETZ.offen, Leser fail-closed):
        "TOR_FLUEGEL_OFFEN",
        // ZWILLINGS-ABSCHIED 19.07. — Groove/Skala/Tempo/Swing wohnen im
        // klang-Gesetzbuch (RHYTHMUS_MUSTER · SCALES/scaleFor · GENRES),
        // die vier Konstanten-Zwillinge sind gefallen:
        "LOFI_GROOVE_PATTERN",
        "GROOVE_SWING",
        "LOFI_BPM",
        "LOFI_SCALE",
    ];
    const zwillingsTreffer = (src) =>
        ZWILLINGE.filter((n) => new RegExp("^AnazhRealm\\." + n + "\\s*=", "m").test(src));
    (function zwillingsAbsenz() {
        let src = null;
        try {
            src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
        } catch (_e) {}
        const treffer = src ? zwillingsTreffer(src) : ZWILLINGE;
        check(
            "ZWILLINGS-ABSENZ: kein gefallener Fallback-Zwilling kehrt als Stamm-Zuweisung wieder (" +
                ZWILLINGE.length +
                " Namen)",
            !!src && treffer.length === 0,
            treffer.length ? "wieder aufgetaucht: " + treffer.join(", ") : ZWILLINGE.length + " Namen abwesend"
        );
        // SELBST-TEST: die Wand ist nicht vakuös — ein injizierter Zwilling
        // (präparierter Quelltext) MUSS gefunden werden.
        const injiziert = src ? zwillingsTreffer(src + "\nAnazhRealm.SWING_LAWS = Object.freeze({});\n") : [];
        check(
            "SELBST-TEST: ein injizierter Zwilling (SWING_LAWS-Zeile) feuert die Absenz-Wand",
            injiziert.length === 1 && injiziert[0] === "SWING_LAWS",
            injiziert.join(",") || "keine Erkennung"
        );
        // ZWILLINGS-ABSCHIED 18.07. — die INLINE-FALLBACK-Klasse (HIMMEL/WASSER):
        // ein `globalThis.<GESETZ>) || {`-Zwilling im Stamm ist die V18.487-
        // Klasse in Funktions-Gestalt. Die Wand: (a) das Muster ist im Stamm
        // ABWESEND, (b) die Signatur-Literale wohnen NUR im Gesetzbuch
        // (foundry-core), (c) terrain steht in GESETZ_KERNE (Kern-Pflicht
        // deckt die Welt-Look-Gesetze). Code-förmige Muster — Kommentare
        // zitieren die Namen straflos.
        const inlineZwilling = (s) => /globalThis\.(HIMMEL|WASSER)_GESETZ\)\s*\|\|\s*\{/.test(s);
        const signaturen = ["projY: 0.16", "wK: [6.5"];
        (function inlineAbsenz() {
            let fc = null;
            try {
                fc = fs.readFileSync(path.join(root, "foundry-core.js"), "utf8");
            } catch (_e) {}
            const imStamm = src ? signaturen.filter((sig) => src.indexOf(sig) >= 0) : signaturen;
            check(
                "ZWILLINGS-ABSENZ: kein globalThis-||-Inline-Fallback (HIMMEL/WASSER) im Stamm, Signaturen nur im Gesetzbuch",
                !!src && !inlineZwilling(src) && imStamm.length === 0,
                imStamm.length ? "Signatur im Stamm: " + imStamm.join(" · ") : "abwesend"
            );
            check(
                "KONSUM: terrain steht in GESETZ_KERNE und foundry-core trägt __terrainCore (HIMMEL+WASSER)",
                !!src &&
                    /terrain:\s*"__terrainCore"/.test(src) &&
                    !!fc &&
                    /var __terrainCore = \{ HIMMEL_GESETZ/.test(fc)
            );
            const inj = inlineZwilling(
                'const HG = (typeof globalThis !== "undefined" && globalThis.HIMMEL_GESETZ) || { projY: 0.16 };'
            );
            check("SELBST-TEST: ein injizierter Inline-Fallback feuert die Wand", inj === true);
            // FELS-/KRISTALL-HÜLLE (18.07., M1): der vierte Gesetz-Blocker-Zweig
            // lebt (Konsum: _felsBlockerParts VOR dem generischen Parts-Pfad im
            // EINEN Chokepoint) und die Tafel trägt die gemessene Hülle.
            const pbaM = src && src.match(/_populateBlockerAABBs\(entry\) \{[\s\S]{0,9000}?entry\.blockerAABBs = solidAABBs/);
            check(
                "KONSUM: der Fels-Blocker-Zweig liest die Studio-Hülle (fx.huelle) im EINEN Chokepoint vor dem Parts-Pfad",
                !!pbaM && pbaM[0].indexOf("_felsBlockerParts") >= 0 && !!fc && /huelle: \{ rx:/.test(fc)
            );
        })();
    })();

    // SELBST-TEST — das Gate ist nicht vakuös: eine injizierte Verletzung
    // (Rezept ohne kind + kaputte rarity) MUSS erkannt werden.
    const broken = {
        vertrag: 1,
        presets: { testkaputt: { s: { a: 0.5 } }, "BÖSE ID": { kind: "tree" } },
        build: function () {},
        cfg: {
            placement: {
                rarity: { x: 7 },
                boden: {
                    geist: { ring: "nah", dichte: 1, skala: [1, 2] },
                    "BÖSE ID": { ring: "fern", dichte: 0, skala: [2, 1], licht: [0.5, 0.2, 1, 2], weite: -3 },
                },
            },
            lod: {
                kindStages: { kaputt: [9], falschrum: [2, 1], tree: [0, 1, 2] },
                budget: {
                    geist: { 0: {} },
                    tree: {
                        3: {},
                        0: { tris: 100, draws: 1, schatten: false },
                        1: { tris: 200, draws: 0, schatten: "ja", karte: true, blattKarte: -1, deckung: [1.2, 0.9] },
                        fernform: "nebel",
                    },
                    gestalten: { eiche: 0 },
                },
            },
        },
        params: null,
        lehren: null,
    };
    const bv = validateManifest(broken);
    // B2c — ein zweites Budget: Regler-Form (nadelKarte) und steigende draws.
    const bvB = validateManifest({
        vertrag: 1,
        zweit: true,
        presets: { a: { kind: "shrub" } },
        build: function () {},
        cfg: {
            lod: {
                kindStages: { shrub: [1, 2], rock: [0, 1] },
                budget: {
                    shrub: {
                        1: {
                            tris: 10,
                            draws: 1,
                            schatten: 1,
                            nadelKarte: -2,
                            dichte: { laub: 1.5 },
                            rinde: { ast: 0.1, reisig: 0.3 },
                            straehne: { teile: 0, breite: 1 },
                            schnitt: 0.2,
                            rute: 0.1,
                            boden: 1.5,
                            band: 10,
                        },
                        2: { tris: 5, draws: 2, schatten: false },
                        fernform: "karte",
                    },
                    // ein Zwillings-Kreis 0 → 1 → 0 — und ohne Fernform (Pflicht je Budget-Art)
                    rock: { 0: { tris: 10, draws: 1, schatten: 1 }, 1: { tris: 5, draws: 1, schatten: 0 } },
                    // W8 — Gestalten eines Zweit-Kerns: eine 0 und ein fremdes Rezept.
                    gestalten: { a: 0, geist: 2 },
                },
            },
        },
    });
    bvB.push(
        ...validateManifest({
            vertrag: 1,
            zweit: true,
            presets: { a: { kind: "shrub" }, b: { kind: "shrub" } },
            build: function () {},
            // W8 — ein Zweit-Kern ohne Zahl für Rezept b und mit der '*'-Zeile des Haupt-Kerns.
            cfg: { lod: { kindStages: { shrub: [1] }, budget: { shrub: { 1: { tris: 9, draws: 1, schatten: false } }, gestalten: { a: 1, "*": 3 } } } },
        })
    );
    const bvVer = validateManifest({ vertrag: null, presets: { a: { kind: "tree" } }, build: function () {} });
    // §8 — ein MESHFREI-Kern mit buildInstance ist widersprüchlich (die Linse feuert).
    const bvMesh = validateManifest({
        vertrag: 1,
        presets: { a: { kind: "klang" } },
        build: function () {},
        meshfrei: true,
    });
    // V18.486 — auch die Gefühls-Block-Prüfungen feuern auf Injektion:
    const bvFx = validateManifest({
        vertrag: 1,
        presets: {
            mensch: { kind: "koerper", fx: { bewegung: { schwimmen: { tauchV: 1 }, parkour: { kletterV: 1 } } } },
        },
        build: function () {},
        arena: { schwung: {} },
        fahr: { lenkung: { sfK: 0.05 } },
        verhalten: { aktionen: { a: {} }, stimmung: { x: { aktionen: ["fremd"], alle: [1, 2] } } },
    });
    check(
        "SELBST-TEST: injizierte Verletzungen werden erkannt (kein-kind · Namensraum · rarity · Boden-Gesetz · kindStages · Budget · Fernform · Version · MESHFREI-Widerspruch · Gefühls-Blöcke)",
        bv.some((s) => s.includes("kein kind")) &&
            bv.some((s) => s.includes("Namensraum")) &&
            bv.some((s) => s.includes("rarity")) &&
            bv.some((s) => s.includes("kindStages.kaputt")) &&
            bv.some((s) => s.includes("kindStages.falschrum")) &&
            bv.some((s) => s.includes("budget.geist")) &&
            bv.some((s) => s.includes("budget.tree[3] — keine gelieferte Stufe")) &&
            bv.some((s) => s.includes("budget.tree[2] fehlt")) &&
            bv.some((s) => s.includes("tris fällt nicht streng")) &&
            bv.some((s) => s.includes("tree[1].draws muss")) &&
            bv.some((s) => s.includes("tree[1].schatten muss")) &&
            bv.some((s) => s.includes("tree[1].karte — nur die letzte Stufe")) &&
            bv.some((s) => s.includes("blattKarte muss")) &&
            bv.some((s) => s.includes("deckung muss")) &&
            bv.some((s) => s.includes("gestalten trägt keine")) &&
            bv.some((s) => s.includes("gestalten.eiche muss")) &&
            bv.some((s) => s.includes("placement.boden.geist — kein Preset")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID — keine eigene Gestalten-Zeile")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.ring muss")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.dichte muss")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.skala muss")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.licht muss ein Trapez")) &&
            bv.some((s) => s.includes("placement.boden.BÖSE ID.weite muss")) &&
            bvB.some((s) => s.includes("nadelKarte muss")) &&
            bvB.some((s) => s.includes("dichte.laub muss")) &&
            bvB.some((s) => s.includes("rinde muss")) &&
            bvB.some((s) => s.includes("straehne muss")) &&
            bvB.some((s) => s.includes("schnitt < rute")) &&
            bvB.some((s) => s.includes("boden muss")) &&
            bvB.some((s) => s.includes("draws steigt")) &&
            bv.some((s) => s.includes("tree.fernform muss")) &&
            bvB.some((s) => s.includes("shrub.fernform — \"karte\" genau dann")) &&
            bvB.some((s) => s.includes("rock.fernform muss")) &&
            bvB.some((s) => s.includes("rock[0].schatten — der Zwilling (Stufe 1) wirft nicht selbst")) &&
            bvB.some((s) => s.includes("shrub[1].band muss")) &&
            bvB.some((s) => s.includes("gestalten.a muss")) &&
            bvB.some((s) => s.includes("gestalten.geist — kein Rezept")) &&
            bvB.some((s) => s.includes("gestalten.* — kein Rezept")) &&
            bvB.some((s) => s.includes("gestalten.b fehlt")) &&
            bvVer.some((s) => s.includes("G4.3")) &&
            bvMesh.some((s) => s.includes("MESHFREI")) &&
            bvFx.some((s) => s.includes("schwimmen unvollständig")) &&
            bvFx.some((s) => s.includes("parkour unvollständig")) &&
            bvFx.some((s) => s.includes("ARENA unvollständig")) &&
            bvFx.some((s) => s.includes("FAHR.lenkung unvollständig")) &&
            bvFx.some((s) => s.includes("VERHALTEN unvollständig")),
        `${bv.length + bvVer.length + bvMesh.length + bvFx.length} erkannt`
    );

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Vertrags-Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — der Studio-Vertrag steht als Struktur: jeder registrierte Kern erfüllt die MUSS-Blöcke, die SOLL-Blöcke validieren wo vorhanden, must-ignore ist am Chokepoint verankert, und der Selbst-Test beweist die Linse feuert."
    );
    process.exit(0);
})();
