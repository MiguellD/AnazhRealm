#!/usr/bin/env node
// gate:weltgrenze — KEIN WELT-ZUSTAND REIST ÜBER EINE WELTGRENZE.
//
// Die Gegenprüfung Runde 2 fand den Spread `{ ...this.state.worldMeta, ...state.worldMeta }` im Restore: jede
// Welt, die ohne Erbgut geladen wurde, behielt das Erbgut, den Anker, die Edits, die Dorf-Zellen und die Stempel der
// Welt davor — über das Welt-Tor „Ersetzen" wurde eine Wildnis-Welt still als Insel gezeichnet und mit dem Erbgut der
// Prüfbühne gespeichert. Diese Linse fährt JEDEN Weg, auf dem eine Welt B die Seite oder den Speicher einer Welt A
// betritt, und nennt jedes Feld von A, das B danach trägt, beim Namen. Die Gegenprüfung Runde 3 fand zwei Wege, auf denen
// der Speicher eine Mischung trägt oder eine Welt verliert: eine Welt ohne worldId lag roh auf dem Platz von A, und der
// Boot vergab vor dem Lesen des Platzes eine neue Id (beide Welten fort); und zwischen `location.reload()` und dem Tod der
// Seite schrieb jeder saveState die lebende Seite unter den Namen von B oder setzte den Aktiv-Zeiger auf A zurück. Seit tore-k5-tuer
// tauscht jede Tür am Ort (`_weltWechsel`): die Seite lädt nie neu, ihr ganzer Zustand nach dem Tausch ist B allein.
//
//   laden               `loadState(B)` in der lebenden Seite (der Engpass jedes Ladens: Boot, „lade zustand")
//   ersetzen[-ohne-id|-ohne-meta]   das Welt-Tor „Ersetzen" (`_weltTorImportReplace`)
//   ersetzen-quota      dasselbe, der Speicher wirft beim Ablegen (Quota): die Seite bleibt laut in A, kein Reload
//   weltpull[-ohne-id|-ohne-meta]   der Snapshot des Hosts (`_p2pApplyWorldSnapshot`, Resync, world-pull)
//   portal              das Adress-Portal (`_enterPortalToAddress` → `_weltBeitritt` gegen einen Schein-Broker)
//   einladung           der Beitritt per Einladung (`_weltBeitritt` → `_importGuestWorld`, Schein-Broker)
//   geburt              „Neue Welt" (`createNewWorld`) — erlaubt ist nur die Positiv-Liste (visibility, creator)
//   reload              B liegt im Speicher, die Seite betritt sie durch die Tür (`switchToWorld`, Boot: Vorlade + Restore;
//                       die Formen ohne worldId, ohne worldMeta, korrupt, nur IndexedDB fährt gate:boot-rettung)
//   saat                DIE SAAT IM LAUF (saat-im-lauf): der Satz des Spielers „neue welt saat <Saat>“ in EINER Sitzung, Saat A → B → B
//                       → A am Ort. Jede Welt trägt die genannte Saat in jedem Leser (worldMeta, Voxel-Faden, Planet, Anker) und in
//                       jeder Stelle ihres GEDÄCHTNISSES (Welle saat-argument, `_saatJe`: Gelände-Rausch, Grammatik der Bäume, Wiese
//                       ×5, Ruf und Harmonie des Klangs, Fels und Kristall — je Stelle ihr Leser im Spiel gegen den frisch aus der Saat
//                       gebauten Wert), dieselbe Saat ergibt dieselben Kennzahlen (Höhen, Rausch, Genesis-Ort, Start-Dorf, je Stelle
//                       ihr Wert: A′ = A), B nie die von A (B ≠ A je Stelle) — ein Halter der alten Saat fällt beim Namen.
//                       DER NULL-PUNKT (welt-tag-null): jede Welt trägt `worldMeta.tagNull` 0 ab der Geburt, auch nach ihrem
//                       Laden am Ort; zurück in der Welt des Boots springt der Tag der Prozesse nicht (Δ 0), und ein Alt-Stand
//                       ohne Null-Punkt eicht genau einmal
//                       DAS RENNEN DES VORRATS (vorrat-wartet-erwachen): die Fahrt ERZWINGT, dass der Vorrat des Studios im
//                       Tausch VOR dem Heil der neuen Welt endet — kein Neubau (`_foundryRewarmColdTrees`) läuft in diesem
//                       Fenster, und trat das Fenster nicht ein, fällt die Probe als blind
// Dazu je Tür: A trägt nach dem letzten Autosave noch MARKER-A-SPAET (Fortschritt) — die Tür sichert A vor der Sperre.
// Und statisch (Absenz): eine ganze Welt schreibt in den Speicher nur saveState (die lebende) und `_weltAblegen` (die EINE
// Ablage), `location.reload` steht nur im lauten Rückfall des Wechsels `_weltWechsel` — jeder andere Schreiber fällt beim Namen.
//
// Welt A ist die frisch gebootete Standard-Welt (gespeichert), in die die Linse ein Zeichen pflanzt: das Erbgut der
// Prüfbühne (spec/pruefbuehne/welt.json), einen Makro-Anker, ein Edit, Dorf-Zellen, die Stempel von Ring, Vorschau und
// Saat, Rolle, Bann-Liste, Adresse, Region, Rechte, Modus, Sichtbarkeit, ein Feld, das dieser Build nicht kennt, die
// Gedächtnisse der Seite (Anker, Ring, Vorschau, Dorf-Zug) und ein Tier. Welt B ist eine Wildnis-Welt ohne all das, mit
// MARKER-B im Wissen (je Weg auch ohne worldId oder ohne worldMeta). Jede Tür bekommt das FENSTER DES WECHSELS: ein Edit-Save
// steht vor der Tür an, danach — die alte Welt lebt noch — sofort ein saveState, nach 300 ms einer und ein Edit-Save.
// Geprüft werden: das worldMeta der Seite, die Leser (`_erbgut`, der Worker-Spiegel), die Gedächtnisse,
// der Snapshot der Seite, der Speicher-Eintrag von B (byte-gleich mit der abgelegten Datei, wenn die neue Seite startet),
// der Aktiv-Zeiger, MARKER-B in der erwachten Welt und A unter seiner Id (ohne MARKER-B, im Index) — am Ort (der volle Snapshot
// der Seite, die nie neu lud) und in der nächsten Sitzung (Autosave, Reload).
//
//   node scripts/diag-weltgrenze.cjs [--json datei] [--wurzel dir] [--wege laden,ersetzen,...]
//                                      (`--wurzel` = der Baum eines anderen Stands: vorher ↔ nachher)
//   node scripts/diag-weltgrenze.cjs --selftest   zusätzlich die Scheine: der alte Spread am Lade-Engpass (der Weg
//                                      „laden" MUSS rot werden), saveState ohne die Sperre des Welt-Wechsels (der Weg
//                                      „ersetzen" MUSS rot werden: die Seite erwacht in A), die Geburt, die die Saat des
//                                      Spielers verwirft (der Weg „saat" MUSS die gewürfelte Saat nennen), das Gedächtnis der
//                                      alten Saat, das den Wechsel überlebt (der Weg „saat" MUSS JEDE der 11 Stellen nennen),
//                                      eine Ersatz-Saat neben dem EINEN Leser (die Absenz MUSS sie nennen),
//                                      und die Geburt ohne Null-Punkt (der Weg „saat" MUSS `worldMeta.tagNull` an B nennen)
// Port: WELTGRENZE_PORT (Default 4401). Exit 1 bei einem Befund, einem Page-Error oder einem blinden Selbsttest.
"use strict";
const { frageJa, statikServer, starteBrowser, nullRenderer, hauptLauf, argOpt: opt, weltTor, waitFor, jsonLesen, jsonSchreiben, jsonKlon, path, stammLib, SELBSTTEST, taeter } = require("./lib/welt-boot.cjs");

const JSON_AUS = opt("--json", null);
const PORT = Number(process.env.WELTGRENZE_PORT) || 4401;
const root = path.resolve(opt("--wurzel", path.resolve(__dirname, "..")));
const ALLE_WEGE = [
    "laden",
    "ersetzen",
    "ersetzen-ohne-id",
    "ersetzen-ohne-meta",
    "ersetzen-quota",
    "weltpull",
    "weltpull-ohne-id",
    "weltpull-ohne-meta",
    "portal",
    "einladung",
    "geburt",
    "reload",
    "saat",
];
const WEGE = opt("--wege", ALLE_WEGE.join(","))
    .split(",")
    .filter((w) => ALLE_WEGE.includes(w));
const BUEHNE = jsonLesen("spec/pruefbuehne/welt.json");

const server = statikServer({ root, keinCache: true });

// Beim Start JEDER Seite, vor dem Spiel: der Aktiv-Zeiger und sein Speicher-Eintrag (was die alte Seite hinterließ).
function startFang() {
    try {
        const id = localStorage.getItem("anazhRealmActiveWorld");
        window.__grenzeStart = { id, json: id ? localStorage.getItem("anazhRealmState_" + id) : null };
    } catch {
        window.__grenzeStart = { id: null, json: null };
    }
}

// Die Prüfer in der Seite (überleben jeden Reload: evaluateOnNewDocument).
function seitenPruefer() {
    const T = "GRENZE-A";
    // Die Werte von A ohne Platz für das Zeichen (Aufzählungen): A trägt je einen, den B nie von selbst trägt.
    const A_STUFEN = {
        role: "host",
        regionsActive: true,
        guestRights: "mitschöpfer",
        gameMode: "pfad",
        visibility: "gelistet",
    };
    // Was B ohne eigenen Wert trägt: die Vorlage der Seite (Konstruktor) — die Wege setzen ihre Rolle selbst.
    const VORLAGE = {
        role: "solo",
        regionsActive: false,
        guestRights: "frieden",
        gameMode: "frieden",
        visibility: "privat",
    };
    // Die Pfade, an denen das Zeichen von A steht (Schlüssel oder Wert), gekürzt auf die Ebene des Feldes.
    const pfade = (obj, wurzel, tiefe = 2) => {
        const out = new Set();
        const kurz = (p) =>
            p
                .split(/(?=[.[])/)
                .slice(0, tiefe)
                .join("");
        const geh = (v, p, t) => {
            if (t > 14 || out.size > 60) return;
            if (typeof v === "string") {
                if (v.includes(T)) out.add(kurz(p));
            } else if (Array.isArray(v)) v.forEach((x, i) => geh(x, `${p}[${i}]`, t + 1)); else if (v instanceof Set || v instanceof Map) geh(Array.from(v.keys()), p, t + 1); else if (v && typeof v === "object") for (const k of Object.keys(v)) {
                    if (k.includes(T)) out.add(kurz(`${p}.${k}`));
                    geh(v[k], `${p}.${k}`, t + 1);
                }
        };
        geh(obj, wurzel, 0);
        return Array.from(out);
    };
    // Die Stufen von A, die `wm` ohne Erlaubnis trägt (Seite und Speicher lesen dieselbe), `vor` nennt die Quelle.
    const stufenVonA = (wm, ok, vor) =>
        Object.keys(A_STUFEN)
            .filter((k) => !ok.has(`worldMeta.${k}`) && wm[k] === A_STUFEN[k])
            .map((k) => `${vor}worldMeta.${k} (= ${JSON.stringify(A_STUFEN[k])} von A)`);
    window.__grenze = {
        T,
        // Welt B: eine Wildnis-Welt ohne Erbgut, Anker, Edits, Dörfer und Stempel — geboren wie jede neue Welt, gebaut,
        // BEVOR A ihr Zeichen trägt.
        // `form`: "voll" · "ohne-id" (worldMeta ohne worldId: ein Minimal-Snapshot) · "ohne-meta" (ein Legacy-Save vor Ring 8).
        bauB(slug, form) {
            const b = jsonKlon(r._buildEmptyWorldSnapshot(r._generateFreshWorldMeta(slug), false));
            b.knowledgeBase = ["MARKER-B"];
            if (form === "ohne-id") delete b.worldMeta.worldId;
            if (form === "ohne-meta") delete b.worldMeta;
            return b;
        },
        // B lebt: MARKER-B steht im Zustand der erwachten Seite.
        markerB() {
            return JSON.stringify(r.buildStateSnapshot()).includes("MARKER-B");
        },
        // A BLEIBT unter seiner Id: sein Stand trägt A (nicht B), der Index kennt A; mit `spaet` auch A's Fortschritt seit
        // dem letzten Autosave (die Tür sichert A vor der Sperre). Gelesen wird, was der nächste Boot lädt: die EINE
        // Rettungs-Kette über IndexedDB und den Platz, nachdem der Speicher-Faden alles Gesendete fest hat (die lebende Welt
        // liegt seit speicher-faden nur in IndexedDB, ihr Platz entsteht beim Verlassen).
        async befundeA(aId, spaet) {
            await r._speicherStill();
            const s = r._weltRettungsKette(aId, await r._idbStand(aId)).state;
            if (!s) return [`A: unter ${aId} liegt keine Welt mehr`];
            const out = [];
            const roh = JSON.stringify(s);
            const id = s.worldMeta?.worldId;
            if (id !== aId) out.push(`A: der Platz von A trägt die Welt ${id === undefined ? "ohne worldId" : id}`);
            if (roh.includes("MARKER-B")) out.push("A: der Platz von A trägt B (MARKER-B)");
            if (!r.worldsIndexLoad().some((e) => e?.worldId === aId)) out.push("A: fehlt im Index der Welten");
            if (spaet && !roh.includes("MARKER-A-SPAET"))
                out.push(
                    "A: der Fortschritt seit dem letzten Autosave fehlt (MARKER-A-SPAET) — A wurde vor der Sperre nicht gesichert"
                );
            return out;
        },
        // DAS FENSTER DES WECHSELS: vor der Tür steht ein Edit-Save an (Edit direkt vor dem Ersetzen), nach ihr — die alte Welt
        // lebt noch — ein saveState (Loop-Autosave), nach 300 ms einer und ein Edit-Save (Dorf-Rückruf, Settlement-Export).
        fensterVor() {
            r._scheduleEditSave();
        },
        fensterNach() {
            r.saveState();
            setTimeout(() => {
                try {
                    r.saveState();
                } catch {
                    /* ein Wurf zählt der Page-Error */
                }
            }, 300);
            r._scheduleEditSave();
        },
        // Welt A trägt ihr Zeichen: jedes welt-eigene Feld, die Gedächtnisse der Seite und ein Tier.
        pflanzeA(buehneErbgut) {
            const wm = st.worldMeta;
            Object.assign(wm, A_STUFEN, {
                erbgut: Object.assign({ herkunft: T }, buehneErbgut),
                // das Altfeld eines Spielstands von vor K16 (der Ein-Massiv-Anker fiel) — es reist nie in Welt B
                macro: { herkunft: T },
                // BÜHNE: die fremde Kachel einer Welt-Grenz-Probe: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
                voxelEdits: [{ x: 12345, y: 10, z: 12345, r: 2, mode: "carve", herkunft: T }],
                settlementCells: { [T]: { seed: 7, nH: 3, x: 12345, z: 12345 }, start: { herkunft: T } },
                genesisOrt: T,
                portalPreviewFachwerk: T,
                portalPreviewGarage: T,
                saat: [{ dsl: T }],
                saatGesaet: T,
                bauSame: { [T]: 3 },
                parentWorlds: [T],
                hostInfo: { url: T, roomId: T, peerId: T },
                banList: { peerIds: [T], vibePassKeys: [] },
                worldAddress: { label: T },
                currentRegionKey: T,
                creator: T,
                fusionStrategy: T,
                grenzeFremd: T,
            });
            r._erbgutCache = null;
            r._genesisRingFertig = true;
            r._portalPreviewFertig = Object.assign(Object.create(null), { fachwerk: true });
            r._autoSettlementRejected = new Set([T]);
            r._autoSettlementStartHopeless = true;
            r._autoSettlementQueue = r._dorfZug({ slots: [], name: T }, { x: 0, z: 0 }, T);
            r._stlWegeKeys = new Set([T]);
            // der Plan v2 je Ort (K10, `_ortWahl`): Saat und Anker sind sein Schlüssel, seine Höhen und sein Erdbau sind A —
            // eine Welt B mit demselben Samen am selben Anker läse sonst A's Gelände
            r._ortPlaene = new Map([[T, { herkunft: T }]]);
            // DIE OFFENE ARBEIT DER SEITE: eine ungebackene Karte (ihr Atlas gehört keiner Welt) und ihr Platz in der Back-Schlange
            // reisen mit der Seite — fiel die Schlange mit der Welt, backte die Karte nie (die GT-Vorschau der Prüfbühne wartete nach
            // dem Wechsel ewig, „Fege-Takt archCull wartet", tore-k5-tuer-neu)
            r._impostorAtlas().zellen.set(T, {});
            r._impostorBakeQueue = [T];
            const pm = st.playerMesh;
            const x = pm ? pm.position.x + 6 : 6;
            const z = pm ? pm.position.z + 6 : 6;
            // DIE LICHT-GEDÄCHTNISSE über ihre echten Schreiber: das wache Tor (`_tickPortalLicht`) und der Licht-Pool,
            // der es hält (`_leuchtTakt`) — die Laterne eines Plans ist ein Eintrag der Welt (`laterne_dorf`), kein Gedächtnis.
            // Das Tor steht 3 m vor dem Auge in seiner Höhe (im Kegel und im Umkreis des Pools, wo die Kamera der Seite auch steht —
            // vor jeder Laterne des Genesis-Orts: seine Kern-Laternen hielten sonst die vier Plätze, ein Tor seitlich hinter dem
            // Spieler rangiert hinter jeder im Bild), der Pool wählt frisch wie nach dem Boot
            // Die Kamera steht, wo das Rig sie setzt: am EINEN Auge (`_lodAuge`, das der Pool liest) — die ungesetzte Kamera
            // der Kopflos-Seite steht am Ursprung, ein Tor vor ihr läge außer Umkreis des Auges
            st.camera.position.copy(r._lodAuge());
            st.camera.updateMatrixWorld(true);
            const cam = st.camera.position;
            r._leuchtPool = null;
            r._tickPortalLicht({
                entry: { position: st.camera.getWorldDirection(cam.clone()).setY(0).normalize().multiplyScalar(3).add(cam), scale: 1 },
                tor: { mu: { springY: 1 } },
                _act: 1,
                u: null,
            });
            r._portalLeuchte.herkunft = T;
            r._ensureAtmoUniforms();
            r._leuchtTakt();
            const tier = r.spawnCreatureAt(x, r.getTerrainHeightAt(x, z) + 1, z, "happy", null, { precise: true });
            if (tier?.userData) tier.userData.name = T;
            const licht = [
                r._portalLeuchte?.herkunft === T ? null : "_portalLeuchte",
                r._leuchtPool?.halter.some((h) => h?.herkunft === T) ? null : "_leuchtPool",
            ].filter(Boolean);
            return { erbgut: r._erbgut().terme.map((t) => t.art), tier: !!tier, lichtBlind: licht };
        },
        // Die lebende Seite in Welt B: jedes Feld von A beim Namen. `ganz` = auch der volle Snapshot der Seite (nach einem
        // Wechsel: am Ort trägt die Seite nach dem Tausch B allein, in der nächsten Sitzung der Speicher).
        befundeLive(erlaubt, ganz) {
            const ok = new Set(erlaubt || []);
            const out = [];
            const wm = st.worldMeta || {};
            for (const p of pfade(wm, "worldMeta")) if (!ok.has(p)) out.push(p);
            out.push(...stufenVonA(wm, ok, ""));
            const e = r._erbgut();
            if (!(e.terme.length === 1 && e.terme[0].art === "wildnis"))
                out.push(`Leser _erbgut() [${e.terme.map((t) => t.art).join(", ")}]`);
            const ws = r._voxelWorkerSnapshotState();
            for (const p of pfade(ws, "Worker-Spiegel")) out.push(p);
            if (ws.erbgut?.wildnis !== 1) out.push("Worker-Spiegel.erbgut (keine Wildnis)");
            const ged = {
                _genesisRingFertig: r._genesisRingFertig === true,
                _portalPreviewFertig: !!r._portalPreviewFertig?.fachwerk,
                _autoSettlementRejected: !!r._autoSettlementRejected?.has(T),
                _autoSettlementStartHopeless: r._autoSettlementStartHopeless === true,
                _autoSettlementQueue: r._autoSettlementQueue?.cellKey === T,
                _stlWegeKeys: !!r._stlWegeKeys?.has(T),
                _ortPlaene: !!r._ortPlaene?.has(T),
                _portalLeuchte: r._portalLeuchte?.herkunft === T,
                _leuchtPool: !!r._leuchtPool?.halter.some((h) => h?.herkunft === T),
            };
            for (const k of Object.keys(ged)) if (ged[k]) out.push(`Gedächtnis this.${k}`);
            if (r._kartenAtlas?.zellen.has(T) && !r._impostorBakeQueue?.includes(T)) out.push("Seite: Karte ohne Back-Schlange");
            if (ganz) {
                const snap = r.buildStateSnapshot();
                for (const p of pfade(snap, "Snapshot", 3)) if (!ok.has(p.replace(/^Snapshot\./, ""))) out.push(p);
            }
            return Array.from(new Set(out));
        },
        // Der Speicher-Eintrag von B (die Wahrheit des nächsten Boots).
        befundeSpeicher(weltId, erlaubt) {
            const ok = new Set(erlaubt || []);
            const roh = localStorage.getItem(r.worldStorageKey(weltId));
            if (!roh) return [`Speicher: kein Eintrag für ${weltId}`];
            const s = JSON.parse(roh);
            const out = pfade(s, "Speicher", 3).filter((p) => !ok.has(p.replace(/^Speicher\./, "")));
            const wm = s.worldMeta || {};
            out.push(...stufenVonA(wm, ok, "Speicher."));
            // das Erbgut wohnt im Gesetz der Welt (ultiversum.K1, `worldMeta.gesetz.gelaende`)
            if (wm.gesetz?.gelaende != null) out.push("Speicher.worldMeta.gesetz.gelaende");
            return out;
        },
        VORLAGE,
    };
}

// Die Seite ist erwacht (die Welt bereit). Mit `weltId`: in DIESER Welt — sonst sofort der Name der Welt, in der sie erwachte.
async function bereit(page, weltId) {
    return page.evaluate(async (weltId) => {
        const t0 = performance.now();
        await __weltDa((w) => w.state?.worldMeta);
        const welt = st.worldMeta.worldId;
        return { ok: !weltId || welt === weltId, ms: Math.round(performance.now() - t0), welt };
    }, weltId || null);
}

// DIE ABSENZ (statisch, im Stamm des Baums, über den EINEN Helfer stammLib.fehlt): eine ganze Welt schreibt nur `_weltAblegen`
// (die EINE Ablage) und `_speicherVerlassen` (die verlassene) auf ihren Platz, `location.reload` steht nur im lauten Rückfall
// des Welt-Wechsels `_weltWechsel`. Jeder andere Ort fällt mit Datei und Zeile (fehlt.wo); die Engstellen sind Glieder am AST.
function absenz() {
    const out = [];
    const pruefe = (re, ausser, was) => stammLib.fehlt({ ausser }, re) || out.push(`${was}: ${stammLib.fehlt.wo}`);
    pruefe(
        /localStorage\.setItem\(this\.worldStorageKey\(/,
        ["_weltAblegen", "_speicherVerlassen"],
        "Welt-Schreiber neben der EINEN Ablage"
    );
    pruefe(/location\.reload\(\)/, ["_weltWechsel"], "Reload neben dem Welt-Wechsel");
    // DIE EINE SAAT (Welle saat-argument): keine Ersatz-Saat neben dem EINEN Leser (`_saat`, im Faden `saatDesFadens`) — die
    // Eingangs-Saat steht nur im Samen-Kern (`EINGANG`), ihr EINER Leser ist das Heil; bis hier 43 Kopien und `LAGE_GRUND.seed`
    for (const [quelle, was] of ERSATZ_ORTE)
        if (!stammLib.fehlt(null, ERSATZ, quelle)) out.push(`Ersatz-Saat neben dem EINEN Leser (${was}): ${stammLib.fehlt.wo}`);
    return out;
}
// das Literal selbst, eine Saat, die still auf einen Text ausweicht (`….seed) || "…"`), und die alte Grund-Saat des Gelände-Kerns
const ERSATZ = /["'`]anazh-realm-seed["'`]|\.seed\)?\s*\|\|\s*["'`]|LAGE_GRUND\.seed/;
const ERSATZ_ORTE = [
    [null, "Stamm"],
    [{ datei: "voxel-worker.js" }, "Voxel-Faden"],
    [{ datei: "gelaende-core.js" }, "Gelände-Kern"],
    [{ datei: "worlds/fachwerk/fachwerk.js" }, "Fachwerk-Studio"],
];

const TUEREN = new Set(["ersetzen", "weltpull", "portal", "einladung", "geburt"]);

// Ein Weg in einem frischen Browser-Kontext (eigener Speicher): A booten und speichern, B bauen, A zeichnen, den Weg gehen
// (eine Tür im Fenster des Wechsels), B prüfen und A. `schein`: "spread" (der alte Spread am Lade-Engpass) · "sperre" (saveState
// ohne die Sperre des Welt-Wechsels) · "stand" (der Prototyp trägt Stand: der Griff des Prüfbühnen-Zensus bis 30.10., `P[n]`
// weckte den Getter `dslPositions` mit dem Prototyp als this — der Abschied bricht den Tausch beim Namen, die Tür sagt es).
// DIE ZEHN SCHEINE DES SELBSTTESTS mit Namen, Schlüssel in `selbst` und der Fahrt, die ihn trägt (5 und 6 teilen eine Sitzung, 9 und 10
// eine, 4 und 11 eine, 8 ist statisch)
const SCHEINE = [
    ["1 Spread am Lade-Engpass", "spread", "spread"],
    ["2 saveState ohne die Sperre", "sperre", "sperre"],
    ["3 Prototyp trägt Stand", "stand", "stand"],
    ["4 Geburt verwirft die Saat", "zufall", "zufall"],
    ["5 Gedächtnis der alten Saat überlebt den Wechsel", "gedaechtnis", "gedaechtnis"],
    ["6 Geburt ohne Null-Punkt", "tagnull", "gedaechtnis"],
    ["8 Ersatz-Saat neben dem EINEN Leser", "ersatz", "ersatz"],
    ["9 Neubau im Tausch vor dem Heil", "vorrat", "vorrat"],
    ["10 Anker der Sonne je Seite", "anker", "vorrat"],
    ["11 Merker des Ankers fällt mit der Welt", "merker", "zufall"],
];
// welcher Schein blind blieb — je einer mit den ersten zwei Befunden seiner Fahrt (oder „kein Befund“: die Fahrt sah nichts)
const blindeScheine = (selbst) =>
    !selbst
        ? ["kein Selbsttest gefahren"]
        : SCHEINE.filter(([, k]) => !selbst[k].length).map(([n, , f]) => {
              const b = selbst.befunde[f] || [];
              return `${n} — seine Fahrt meldete ${b.length ? `${b.length} andere Befunde: ${b.slice(0, 2).join(" · ")}` : "keinen Befund"}`;
          });
async function fahreWeg(browser, weg, schein) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    const rep = { weg, schein, befunde: [], erlaubt: [], boot: [], navigiert: null };
    const basis = weg.split("-")[0];
    const form = weg.endsWith("-ohne-id") ? "ohne-id" : weg.endsWith("-ohne-meta") ? "ohne-meta" : "voll";
    const tuer = TUEREN.has(basis);
    let gemeldet = null;
    await page.evaluateOnNewDocument(frageJa); // die Fragen der Welt (#frage-dialog, spielgang.K5)
    await page.exposeFunction("__grenzeMelde", (x) => {
        gemeldet = x;
    });
    await page.evaluateOnNewDocument(startFang);
    await nullRenderer(page);
    await page.evaluateOnNewDocument(seitenPruefer);
    const t0 = Date.now();
    const lege = async (fn, ...a) => (await page.evaluate(fn, ...a)) || [];
    try {
        await server.zeige(page, 60000);
        const a = await bereit(page, null);
        rep.boot.push(a.ms);
        if (!a.ok) throw new Error("Welt A nicht bereit nach 120 s");
        // A ist gespeichert (sein Platz besteht), bevor sie ihr Zeichen trägt
        const aId = await page.evaluate(() => {
            r.saveState();
            return st.worldMeta.worldId;
        });
        const B = await page.evaluate((f) => window.__grenze.bauB("grenze-b", f), form);
        rep.pflanzung = await page.evaluate((e) => window.__grenze.pflanzeA(e), BUEHNE.worldMeta.erbgut);
        // die Licht-Gedächtnisse tragen das Zeichen, ehe die Tür sie prüft (sonst sähe die Linse nichts)
        for (const k of rep.pflanzung.lichtBlind)
            rep.befunde.push(`die Pflanzung ist blind: this.${k} trägt das Zeichen von A nicht`);
        // A's Fortschritt nach dem letzten Autosave: er muss die Tür überleben (auf A's Platz)
        await page.evaluate(() => {
            st.knowledgeBase = (st.knowledgeBase || []).concat(["MARKER-A-SPAET"]);
        });
        if (schein === "spread") {
            // DER ALTE SPREAD ZUM SCHEIN: nach jedem Laden mischt sich das worldMeta der alten Welt darunter.
            await page.evaluate(() => {
                const roh = r.loadState.bind(r);
                r.loadState = (s) => {
                    const alt = st.worldMeta;
                    const e = roh(s);
                    st.worldMeta = { ...alt, ...st.worldMeta };
                    r._erbgutCache = null;
                    return e;
                };
            });
        }
        if (schein === "sperre") {
            // SAVESTATE OHNE DIE SPERRE ZUM SCHEIN: im Fenster des Wechsels schreibt die alte Welt wieder.
            await page.evaluate(() => {
                const roh = r.saveState.bind(r);
                r.saveState = () => {
                    const s = r._weltWechselSperre;
                    r._weltWechselSperre = false;
                    try {
                        return roh();
                    } finally {
                        r._weltWechselSperre = s;
                    }
                };
            });
        }
        if (schein === "stand") await page.evaluate(() => void (window.__alteSeite = Object.getPrototypeOf(r).dslPositions));
        // DIE SEITE LÄDT NIE NEU (der Wechsel am Ort): jede Navigation nach dem Boot von A ist ein Befund
        let navigationen = 0;
        page.on("framenavigated", (f) => f === page.mainFrame() && navigationen++);
        const lauf = await page
            .evaluate(
                async (weg, basis, B, aId) => {
                    const g = window.__grenze;
                    const ablage = (id) => ({
                        ziel: id,
                        abgelegt: id ? localStorage.getItem(r.worldStorageKey(id)) : null,
                    });
                    if (basis === "laden") {
                        r.loadState(B);
                        return { inSeite: g.befundeLive([], false).concat(await g.befundeA(aId)) };
                    }
                    if (basis === "ersetzen") {
                        if (weg === "ersetzen-quota") {
                            const key = r.worldStorageKey(B.worldMeta.worldId);
                            const roh = Storage.prototype.setItem;
                            Storage.prototype.setItem = function (k, v) {
                                if (k === key) throw new DOMException("Speicher voll (Linse)", "QuotaExceededError");
                                return roh.call(this, k, v);
                            };
                        }
                        g.fensterVor();
                        st.pendingImport = { parsed: B, fileName: "grenze-b.json" };
                        r._weltTorImportReplace();
                        const out = ablage(r.activeWorldGet());
                        const chat = document.getElementById("chat-output");
                        out.chat = chat ? chat.innerHTML : ""; // die Schlüssel der Zeilen am Knoten, nie der Wortlaut
                        out.liveWelt = st.worldMeta.worldId;
                        g.fensterNach();
                        return out;
                    }
                    if (basis === "weltpull") {
                        g.fensterVor();
                        st.p2p.pendingWorldSnapshot = true;
                        r._p2pApplyWorldSnapshot("grenze-host", B);
                        const out = ablage(r.activeWorldGet());
                        g.fensterNach();
                        return out;
                    }
                    if (basis === "geburt") {
                        g.fensterVor();
                        const id = r.createNewWorld({ slug: "grenze-geburt", reload: true });
                        const out = ablage(id);
                        g.fensterNach();
                        return out;
                    }
                    if (basis === "portal" || basis === "einladung") {
                        // DER SCHEIN-BROKER: eine WebSocket, die auf world-request den Snapshot von B schickt (das echte
                        // _weltBeitritt, die echte Gast-Ablage, der echte Rufer `_enterPortalToAddress` bzw. der Code).
                        class ScheinWS {
                            constructor(url) {
                                this.url = url;
                                this.h = {};
                                setTimeout(() => this.feuer("open", {}), 0);
                            }
                            addEventListener(t, f) {
                                (this.h[t] = this.h[t] || []).push(f);
                            }
                            feuer(t, ev) {
                                for (const f of this.h[t] || []) f(ev);
                            }
                            send(d) {
                                const m = JSON.parse(d);
                                if (m.type === "world-request")
                                    setTimeout(
                                        () =>
                                            this.feuer("message", {
                                                data: JSON.stringify({
                                                    type: "world-snapshot",
                                                    peerId: "grenze-host",
                                                    state: B,
                                                }),
                                            }),
                                        0
                                    );
                            }
                            close() {}
                        }
                        window.WebSocket = ScheinWS;
                        const roh = r._importGuestWorld.bind(r);
                        r._importGuestWorld = (...a) => {
                            const id = roh(...a);
                            window.__grenzeMelde(ablage(id));
                            g.fensterNach();
                            return id;
                        };
                        g.fensterVor();
                        const id = B.worldMeta.worldId;
                        if (basis === "portal")
                            await r._enterPortalToAddress(
                                { type: "welt_portal", affordances: { isPortal: true } },
                                { worldId: id, roomId: id, broker: "ws://127.0.0.1:9", label: "grenze-b" }
                            );
                        else await r._weltBeitritt({ broker: "ws://127.0.0.1:9", roomId: id }, { slugHint: "grenze-b" });
                        return {};
                    }
                    if (basis === "reload") {
                        const id =
                            B.worldMeta?.worldId || "grenze-platz-" + Date.now();
                        localStorage.setItem(r.worldStorageKey(id), JSON.stringify(B));
                        r.worldsIndexUpsert({
                            worldId: id,
                            slug: "grenze-b",
                            bornAt: Date.now(),
                            lastPlayed: Date.now(),
                        });
                        return { ziel: id };
                    }
                    return {};
                },
                weg,
                basis,
                B,
                aId
            )
            .catch((e) => ({ abbruch: String(e?.message || e) }));
        // B liegt im Speicher: die Seite betritt sie durch die Tür (`weltTor`, der Wechsel am Ort), nie über den Zeiger von Hand.
        // Zum Schein „stand" bricht der Tausch beim Namen und die Seite lädt neu (der laute Rückfall): erst wenn die neue Seite
        // erwacht ist, schließt der Kontext — ein Schließen in die Navigation hing bis zur Frist des Browsers.
        if (basis === "reload" && lauf?.ziel)
            await weltTor(page, lauf.ziel).catch(async (e) => {
                if (schein !== "stand") throw e;
                rep.befunde.push(e.message);
                await waitFor(page, () => !window.__alteSeite && r?._gameLoopTick, "der Rückfall");
            });
        if (schein === "stand") return rep;
        if ((basis === "portal" || basis === "einladung") && gemeldet) Object.assign(lauf, gemeldet);
        if (lauf?.inSeite) for (const f of lauf.inSeite) rep.befunde.push(`in der Seite: ${f}`);
        if (basis === "laden") return rep;
        // der Tausch ist durch — oder er brach laut, und die Seite lud neu (`navigationen`)
        await page.evaluate(() => r.erwacht).catch(() => {});
        rep.navigiert = navigationen > 0;
        if (weg === "ersetzen-quota") {
            // KEIN WECHSEL OHNE GELUNGENE ABLAGE: die Seite bleibt in A, und sie sagt es.
            if (rep.navigiert) rep.befunde.push("die Seite lud ohne gelungene Ablage neu — der alte Stand lädt still");
            const z = await page.evaluate(() => ({
                zeiger: r.activeWorldGet(),
                welt: st.worldMeta.worldId,
            }));
            if (z.zeiger !== aId) rep.befunde.push(`der Aktiv-Zeiger zeigt nach der gescheiterten Ablage auf ${z.zeiger}`);
            if (z.welt !== aId) rep.befunde.push(`die Seite trägt nach der gescheiterten Ablage die Welt ${z.welt}`);
            if (!/"speicher\.ersetzen-fehl"/.test(lauf.chat || "")) rep.befunde.push("die gescheiterte Ablage blieb still (kein Satz im Chat)");
            rep.befunde.push(...(await lege((id) => window.__grenze.befundeA(id, true), aId)));
            return rep;
        }
        const ziel = lauf?.ziel;
        if (!ziel) throw new Error(`der Weg nannte keine Ziel-Welt (${JSON.stringify(lauf).slice(0, 160)})`);
        if (basis === "geburt") {
            // DIE POSITIV-LISTE DER GEBURT: die Wahl des Schöpfers reist in die neue Welt (Sichtbarkeit, Schöpfer).
            rep.erlaubt = ["worldMeta.visibility", "worldMeta.creator"];
        }
        if (tuer) {
            // AM ORT: die Seite, die nie neu lud, trägt B allein — ihr voller Snapshot, ihre Leser, ihre Gedächtnisse
            if (rep.navigiert) rep.befunde.push("die Tür lud die Seite neu — der Wechsel am Ort brach");
            const z = await bereit(page, ziel); // der Tausch ist durch (`erwacht`): keine eigene Boot-Zeit
            if (!z.ok) rep.befunde.push(`die Seite erwachte in ${z.welt} statt in der Ziel-Welt ${ziel} (am Ort)`);
            else {
                if (basis !== "geburt" && !(await page.evaluate(() => window.__grenze.markerB())))
                    rep.befunde.push("am Ort: MARKER-B fehlt — B lebt nicht");
                rep.befunde.push(
                    ...(await lege((ok) => window.__grenze.befundeLive(ok, true), rep.erlaubt)).map((f) => `am Ort: ${f}`)
                );
            }
            // der nächste Schritt des Spiels — der Autosave schreibt, was die Seite trägt
            await page.evaluate(() => r.saveState()).catch(() => {});
            rep.befunde.push(
                ...(await lege((id, ok) => window.__grenze.befundeSpeicher(id, ok), ziel, rep.erlaubt)).map(
                    (f) => `nach dem Autosave: ${f}`
                )
            );
        }
        // die nächste Sitzung: B liegt unter dem Zeiger, A unter seiner Id
        await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        const b = await bereit(page, ziel);
        rep.boot.push(b.ms);
        const start = await page.evaluate(() => window.__grenzeStart);
        if (tuer && start.id !== ziel)
            rep.befunde.push(`nach dem Wechsel zeigt der Aktiv-Zeiger auf ${start.id} statt auf ${ziel}`);
        rep.befunde.push(
            ...(await lege((id, sp) => window.__grenze.befundeA(id, sp), aId, tuer)).map((f) => `nach dem Reload: ${f}`)
        );
        rep.befunde.push(
            ...(await lege((id, ok) => window.__grenze.befundeSpeicher(id, ok), ziel, rep.erlaubt)).map(
                (f) => `nach dem Reload: ${f}`
            )
        );
        if (!b.ok) rep.befunde.push(`die Seite erwachte in ${b.welt} statt in der Ziel-Welt ${ziel}`); else {
            if (basis !== "geburt" && !(await page.evaluate(() => window.__grenze.markerB())))
                rep.befunde.push("nach dem Reload: MARKER-B fehlt — B lebt nicht");
            rep.befunde.push(
                ...(await lege((ok) => window.__grenze.befundeLive(ok, true), rep.erlaubt)).map(
                    (f) => `nach dem Reload: ${f}`
                )
            );
        }
    } catch (e) {
        rep.befunde.push(`ABBRUCH: ${e?.message || e}`);
    } finally {
        rep.ms = Date.now() - t0;
        rep.befunde = Array.from(new Set(rep.befunde));
        await ctx.close();
    }
    return rep;
}

// DIE KENNZAHLEN EINER WELT AUS IHRER SAAT (Seite, der Weg „saat"): was jeder Leser der Saat trägt und was aus ihr wächst. `leser` die
// Saat je Leser (Rausch: der Strom der Seite gegen den frisch aus der Saat gebauten, an drei Punkten), `wuchs` das Gewachsene.
async function saatKennzahlen() {
    await __weltDa((w) => w.state?.worldMeta && w._genesisPlan);
    const wm = st.worldMeta;
    const L = r._gelaende();
    const frisch = globalThis.__gelaendeCore.lageRausch(wm.seed, SimplexNoise);
    const pkt = [[0.37, 0.11], [-12.5, 40.25], [903.1, -77.7]];
    const rauschFremd = pkt.some(([x, z]) => L.noise.noise2D(x, z) !== frisch.noise2D(x, z));
    // DAS GEDÄCHTNIS DER SAAT (Welle saat-argument): je Stelle ihr Leser im Spiel gegen den Wert, frisch aus der Saat der Welt gebaut
    const R = (suffix) => new SimplexNoise(wm.seed + suffix);
    const [eisen, klump, wiese, wald, gram] = ["-iron-bands", ":clump", ":meadow", ":forest", "-veg-grammatik"].map(R);
    const IB = AnazhRealm.IRON_BANDS.scale;
    const PD = AnazhRealm.PLACEMENT_DENSITY;
    const fbm = (n, x, z) => ((n.noise2D(x, z) + 1) * 0.5) * 0.65 + ((n.noise2D(x * 2.7 + 11.3, z * 2.7 - 5.9) + 1) * 0.5) * 0.35;
    const teile = (p) => JSON.stringify((p || []).map((t) => [t.shape, t.color, t.position, t.size, t.rotation, t.noiseStrength]));
    const STELLEN = [
        ["Gelände-Rausch (_gelaende().noise → hoehe)", (x, z) => L.noise.noise2D(x, z), (x, z) => frisch.noise2D(x, z)],
        ["Grammatik der Bäume (_baumGrammatik → _growTreeBlueprintRich)", (x, z) => r._baumGrammatik().noise2D(x, z), (x, z) => gram.noise2D(x, z)],
        ["Eisen-Adern (_eisenAderAt)", (x, z) => r._eisenAderAt(x, z), (x, z) => (1 - Math.abs(eisen.noise2D(x * IB, z * IB))) ** 2],
        ["Klumpung (_clumpAt)", (x, z) => r._clumpAt(x, z, 0.01), (x, z) => klump.noise2D(x * 0.01, z * 0.01)],
        ["Stand der Wiese (_placementStandAt meadow)", (x, z) => r._placementStandAt(x, z, "meadow"), (x, z) => wiese.noise2D(x * PD.meadowFreq, z * PD.meadowFreq)],
        ["Stand des Walds (_placementStandAt forest)", (x, z) => r._placementStandAt(x, z, "forest"), (x, z) => wald.noise2D(x * PD.forestFreq, z * PD.forestFreq)],
        ["Wald-Rausch (_forestFbm)", (x, z) => r._forestFbm(x, z), (x, z) => fbm(wald, x, z)],
        ["Ruf der Tiere (_klangStrom umwelt → _klangZug)", () => r._klangStrom("umwelt").saat, () => wm.seed],
        ["Harmonie (_klangStrom lofi → _lofiRandom)", () => r._klangStrom("lofi").saat, () => wm.seed],
        ["Fels-Formation (fels_var0.parts → _rockVariant)", () => teile(st.blueprints.fels_var0.parts), () => teile(r._rockVariant(`${wm.seed}-fels-0`))],
        ["Kristall-Formation (kristall_var0.parts → _crystalVariant)", () => teile(st.blueprints.kristall_var0.parts), () => teile(r._crystalVariant(`${wm.seed}-kristall-0`))],
    ];
    const gedaechtnis = {};
    const leserG = {};
    for (const [name, ist, soll] of STELLEN) {
        gedaechtnis[name] = pkt.map(([x, z]) => ist(x, z));
        leserG[name] = pkt.every(([x, z]) => ist(x, z) === soll(x, z)) ? wm.seed : "ein Gedächtnis einer anderen Saat";
    }
    const anker = await r._planetAnker();
    const hoehen = [];
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) hoehen.push(Math.round(r.getTerrainHeightAt(i * 400, j * 400) * 100) / 100);
    // DAS START-DORF urteilt erst nach dem Buch und über der Wahrheit des Wassers um seine Ringe (`_autoSettlementStartInfo`:
    // undefined = offen, die Kacheln sind bestellt). Befund 25.11. (sonnenbahn Kopf 1 und 4, voll 13/18): Wechsel 3 trug das Dorf,
    // der Boot null — das Urteil las `_landAt` vor den Kacheln der Hydrosphäre (Kopf 1), und die Probe fragte vor dem Buch (Kopf 4):
    // das Gesetz der Siedlung ist ein Merker der Klasse (`_siedlungGesetz`, aus dem Buch), kalt am ersten Boot, warm bei der
    // Rückkehr. Die Probe fragt wie das Spiel erst nach dem Buch (`_autoSettlementChannelLive`, der Wächter jedes Siedlungs-Urteils);
    // sie liest am Boot früher, seit der Anker der Sonne mit der Ankunft steht (bis dahin wartete sie hier 1–3 s auf den Planet-Faden)
    await __weltDa((w) => w._autoSettlementChannelLive() && w._autoSettlementStartInfo() !== undefined);
    const dorf = r._autoSettlementStartInfo();
    // DIE SONNE DER WELT (sonnenbahn 2): ihr Anker gehört der Welt — mittags steht die Sonne, wo das Gesetz sie an der Breite DIESER
    // Welt stellt (die Heimat am Anker ihres Planeten, eine Reise-Welt am Ort ihres Teils), nie an der Breite einer Welt davor
    await __weltDa((w) => w._sonnenAnker);
    const teil = L.ort.teil;
    const breite = teil ? (teil.breite * Math.PI) / 180 : anker.breite;
    const winkel = r._sonnenWinkel(0.5);
    const grad = (rad) => (rad * 180) / Math.PI;
    const hoehe = (bahn) => grad(Math.asin(__weltLicht.sonnenRichtung(winkel, bahn)[1]));
    const phase = typeof st.seasonPhase === "number" ? st.seasonPhase : 0.375;
    const koerper = { neigungRad: anker.neigungRad, drehsinn: anker.drehsinn };
    const sonne = { ist: hoehe(r._sonnenBahn()), soll: hoehe(__weltLicht.sonnenBahn(breite, phase, koerper)), breite: grad(breite) };
    return {
        sonne,
        leser: {
            "worldMeta.seed": wm.seed,
            "Voxel-Faden (Spiegel).seed": r._voxelWorkerSnapshotState().seed,
            "_planetSamen()": r._planetSamen(),
            "_planetAnker().samen": anker.samen,
            ...leserG,
        },
        gedaechtnis,
        wuchs: {
            hoehen,
            rausch: pkt.map(([x, z]) => L.noise.noise2D(x, z)),
            anker: [anker.breite, anker.laenge],
            genesis: [r._genesisPlan.ort.x, r._genesisPlan.ort.z],
            startDorf: dorf ? [dorf.seed, dorf.nH, dorf.x, dorf.z] : null,
        },
    };
}

// DER WEG „saat" (saat-im-lauf): EINE Sitzung, der Satz des Spielers „neue welt saat <Saat>“ (die Konsole, `processChatCommand`), am Ort
// A → B → B → A. Befund: eine Welt, die nicht die genannte Saat trägt, ein Leser mit einer anderen Saat (beim Namen), dieselbe Saat mit
// anderen Kennzahlen (je Feld), B gleich A (die Saat wirkt nicht). `schein`: "zufall" (die Geburt verwirft die Saat des Spielers, wie vor
// saat-im-lauf) · "rausch" (der Rausch-Strom der alten Welt überlebt den Abschied).
async function fahreSaat(browser, schein) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    const rep = { weg: "saat", schein, befunde: [], erlaubt: [], boot: [], navigiert: false, saaten: [] };
    const t0 = Date.now();
    const A = "anazh-realm-seed";
    const B = "grenze-saat-b";
    const scheine = String(schein || "").split(",");
    try {
        await page.evaluateOnNewDocument(frageJa);
        await nullRenderer(page);
        await server.zeige(page, 60000);
        const a = await bereit(page, null);
        rep.boot.push(a.ms);
        if (!a.ok) throw new Error("Welt A nicht bereit");
        let navigationen = 0;
        page.on("framenavigated", (f) => f === page.mainFrame() && navigationen++);
        if (scheine.includes("zufall"))
            await page.evaluate(() => {
                const roh = r._generateFreshWorldMeta.bind(r);
                r._generateFreshWorldMeta = (slug) => roh(slug);
            });
        // DAS GEDÄCHTNIS ÜBERLEBT DEN WECHSEL (zum Schein): jede Stelle behält den Wert, den sie zuerst gebar — gleich welche Saat die
        // Welt danach trägt (am Prototyp: der Abschied räumt jedes Feld der Seite, ein Glied am Prototyp reist)
        if (scheine.includes("gedaechtnis"))
            await page.evaluate(() => {
                const roh = AnazhRealm._saatJe;
                const fest = new Map();
                AnazhRealm._saatJe = function (realm, name, bau) {
                    if (name === undefined) return roh.call(this, realm);
                    if (!fest.has(name)) fest.set(name, roh.call(this, realm, name, bau));
                    return fest.get(name);
                };
            });
        if (scheine.includes("tagnull")) await page.evaluate(() => void (AnazhRealm._weltGeburt = (m) => m));
        // DER NULL-PUNKT DER GEBURT (welt-tag-null): jede Welt trägt ihn ab der Geburt (`_weltGeburt`) — die frische Welt des Boots
        // und jede Welt des Satzes, nach ihrem Laden am Ort (dort eichte ein fehlender Null-Punkt auf den Tag der Sicht, +0,4999)
        const nullPunkt = (wann) =>
            page.evaluate(() => r.state.worldMeta.tagNull).then((n) => {
                if (n !== 0) rep.befunde.push(`${wann}: worldMeta.tagNull ${n} statt 0 — die Welt trägt den Null-Punkt ihrer Geburt nicht`);
            });
        const heim = await page.evaluate(() => ({ id: r.state.worldMeta.worldId, tagNull: r.state.worldMeta.tagNull }));
        if (!scheine.includes("tagnull")) await nullPunkt("der Boot");
        const k0 = await page.evaluate(saatKennzahlen);
        rep.saaten.push([A, k0.leser["worldMeta.seed"]]);
        rep.gedaechtnisNamen = Object.keys(k0.gedaechtnis);
        const je = new Map([[A, k0]]);
        const pruefe = (saat, k, wann) => {
            for (const [leser, s] of Object.entries(k.leser))
                if (s !== saat) rep.befunde.push(`${wann}: ${leser} trägt ${s} statt der Saat ${saat}`);
            const S = k.sonne;
            if (!(Math.abs(S.ist - S.soll) <= 0.01))
                rep.befunde.push(
                    `${wann}: die Sonne steht mittags ${S.ist.toFixed(2)}° — das Gesetz an der Breite der Welt (${S.breite.toFixed(3)}°) stellt sie auf ${S.soll.toFixed(2)}° (der Anker der Sonne gehört der Welt, \`WELT_GRENZE.gedaechtnis\`)`
                );
            const ref = je.get(saat);
            if (!ref) return je.set(saat, k);
            for (const f of Object.keys(ref.wuchs))
                if (JSON.stringify(ref.wuchs[f]) !== JSON.stringify(k.wuchs[f]))
                    rep.befunde.push(`${wann}: dieselbe Saat ${saat}, anderes ${f} (${JSON.stringify(k.wuchs[f]).slice(0, 80)} statt ${JSON.stringify(ref.wuchs[f]).slice(0, 80)})`);
            for (const f of Object.keys(ref.gedaechtnis))
                if (JSON.stringify(ref.gedaechtnis[f]) !== JSON.stringify(k.gedaechtnis[f]))
                    rep.befunde.push(`${wann}: dieselbe Saat ${saat}, anderer Wert an ${f} — A′ ≠ A`);
        };
        pruefe(A, k0, "der Boot");
        // DER ANKER DER SONNE JE SEITE (zum Schein, der Stand von sonnenbahn Kopf 1): die Frage hängt an der Seite — jede Welt danach
        // trägt den Anker der Welt des Boots, durch denselben Leser (`_sonnenBahn`). Am Prototyp: der Abschied räumt Felder, nie ihn.
        if (scheine.includes("anker"))
            await page.evaluate(() => {
                const erst = r._sonnenAnker;
                AnazhRealm.prototype._sonnenAnkerFragen = function () {
                    this._sonnenAnkerFrage = this._sonnenAnkerFrage || { teil: null };
                    this._sonnenAnker = erst;
                };
            });
        // DIE KARTE DES WOLKEN-WURFS gehört der Seite (`WELT_GRENZE.seite`): die bleibenden Stoffe lesen sie — nach jedem Wechsel am
        // Ort dieselbe. Fiel sie mit der Welt, legte jede Welt eine neue an (0,34 MB VRAM je Wechsel) und die Stoffe lasen still die alte
        await page.evaluate(() => void (window.__wolkenKarteA = r._wolkenKarte()));
        const wolke = async (wann) => {
            if (!(await page.evaluate(() => r.state.wolkenKarte === window.__wolkenKarteA)))
                rep.befunde.push(`${wann}: die Karte des Wolken-Wurfs fiel mit der Welt (WELT_GRENZE.seite \`wolkenKarte\`)`);
        };
        // DAS RENNEN DES VORRATS (24.11., erbe-geburt 6a548391, voll 12/18: „Die Saat der Welt fehlt (null) — gelesen vor dem Heil“ über
        // `_foundryPrefetchLibrary` → `_foundryRewarmColdTrees` → `_bereitStand` → `_forestSeedInt`; main trug es, die Nachwache davor
        // war grün): waren die Vorräte des Studios beim Wechsel nicht durch, beginnt ihr Lauf nach dem Abschied neu (`_foundryVorraete`)
        // und kann VOR dem Heil der neuen Welt enden — sein Ende baute aktiv neu, ein Glied des Takts außerhalb des Takts, und der
        // Leser der Saat brach beim Namen (nur wenn der Lauf schnell genug war: ein Wackler). Die Probe ERZWINGT die Reihenfolge,
        // statt auf den schnellen Läufer zu hoffen: vor jedem Satz fällt der Merker „durch“ (`_warmCritical`), und der Vorlauf der
        // neuen Welt (er trägt das Heil, `ensureWorldMeta`) hält, bis der neue Lauf durch ist — das FENSTER (höchstens 3 s; die
        // Schleife ist die Wartezeit der Probe, kein Deckel des Spiels). Ein Neubau im Fenster steht beim Namen (`imFenster`), sein
        // Wurf am Leser der Saat geht an den EINEN Sammler; blieb das Fenster aus (`gehalten` 0), ist die Probe blind und fällt.
        // Am Prototyp: der Abschied räumt jedes Feld der Seite, und Funktionen sind dort kein Stand (`_weltAbschied`).
        // `schein` "vorrat": im Fenster baut einer zum Schein aktiv neu (der Ruf, den das Ende des Vorrats bis hier trug).
        await page.evaluate((schein) => {
            const P = AnazhRealm.prototype;
            const G = (window.__vorratRennen = { gehalten: 0, imFenster: 0, fenster: false });
            const [vorlauf, neuBau] = [P._weltVorlauf, P._foundryRewarmColdTrees];
            P._foundryRewarmColdTrees = function (...a) {
                if (G.fenster) G.imFenster++;
                return neuBau.apply(this, a);
            };
            P._weltVorlauf = async function () {
                const f = this._foundry;
                const durch = () => !!f && f._vorrat === false && f._warmCritical === true;
                G.fenster = true;
                for (let i = 0; i < 600 && f && f.ready && !durch(); i++) await sleep(5); // der EINE Schlaf der Seite (welt-boot)
                if (durch()) G.gehalten++;
                if (schein) {
                    Promise.resolve().then(() => this._foundryRewarmColdTrees());
                    await sleep(0);
                }
                G.fenster = false;
                return vorlauf.call(this);
            };
        }, scheine.includes("vorrat"));
        for (const [i, saat] of [B, B, A].entries()) {
            const wann = `Wechsel ${i + 1} (Saat ${saat})`;
            const w = await page.evaluate(async (saat) => {
                const vor = st.worldMeta.worldId;
                if (r._foundry) r._foundry._warmCritical = false; // die Vorräte waren beim Wechsel nicht durch (das Rennen des Vorrats)
                r.processChatCommand(`neue welt saat ${saat}`);
                const ziel = r.activeWorldGet();
                if (ziel === vor) return { ok: false };
                return { ok: await r.erwacht, ziel };
            }, saat);
            if (!w.ok) {
                rep.befunde.push(`${wann}: der Satz „neue welt saat ${saat}" erschuf keine Welt am Ort`);
                break;
            }
            const k = await page.evaluate(saatKennzahlen);
            rep.saaten.push([saat, k.leser["worldMeta.seed"]]);
            pruefe(saat, k, wann);
            await wolke(wann);
            await nullPunkt(wann);
        }
        // das Rennen des Vorrats: das Fenster trat ein (sonst ist die Probe dort blind), und kein Neubau lief in ihm
        const G = (rep.vorrat = await page.evaluate(() => window.__vorratRennen));
        if (!(G.gehalten >= 1))
            rep.befunde.push(
                `das Rennen des Vorrats trat nicht ein: in ${rep.saaten.length - 1} Wechseln endete kein Lauf des Vorrats vor dem Heil der neuen Welt — die Probe ist dort blind`
            );
        if (G.imFenster)
            rep.befunde.push(
                `ein Glied des Takts lief im Tausch der Welt: \`_foundryRewarmColdTrees\` ${G.imFenster}× vor dem Heil der neuen Welt (das Ende des Vorrats \`_foundryPrefetchLibrary\` wartet nicht auf das Erwachen)`
            );
        // DER TAG DER PROZESSE ÜBER SPEICHERN + LADEN: zurück in die Welt des Boots (`switchToWorld`, ihr Stand liegt gespeichert
        // seit dem ersten Satz) — ihr Null-Punkt springt nicht (Δ 0; vor welt-tag-null +0,4999 am ersten Laden)
        // DAS ZWEITE BOOT DERSELBEN WELT (sonnenbahn 2, K6): ihr Anker liegt im Merker je Samen am Wirt (`_planetAnkerJe`,
        // `WELT_GRENZE.wirt`) — die Sonne liest ihn, der Planet-Faden bekommt für sie keinen Auftrag (`planet-anker`). `schein`
        // "merker": der Merker fällt mit der Welt (der Stand bis sonnenbahn 2, jede Ankunft fragte den Faden neu).
        await page.evaluate((merker) => {
            const f = r._planetFadenStand;
            window.__ankerPosten = f ? 0 : null;
            if (!f) return;
            const roh = f.worker.postMessage.bind(f.worker);
            f.worker.postMessage = (m, tr) => (m && m.type === "planet-anker" && window.__ankerPosten++, roh(m, tr));
            if (merker) delete r._planetAnkerJe;
        }, scheine.includes("merker"));
        const zurueck = await page.evaluate(async (id) => r.switchToWorld(id, { reload: true }) && (await r.erwacht), heim.id);
        if (zurueck) {
            rep.zweitBoot = await page.evaluate(async () => (await __weltDa((w) => w._sonnenAnker), window.__ankerPosten));
            if (rep.zweitBoot == null)
                rep.befunde.push("zweites Boot derselben Welt: der Planet-Faden stand vor ihm nicht — die Zeile des Merkers ist blind");
            else if (rep.zweitBoot)
                rep.befunde.push(
                    `zweites Boot derselben Welt: die Sonne weckte den Planet-Faden ${rep.zweitBoot}× (\`planet-anker\`) — ihr Anker lag im Merker je Samen (\`_planetAnkerJe\`, WELT_GRENZE.wirt)`
                );
        }
        const nach = await page.evaluate(() => r.state.worldMeta.tagNull);
        rep.tagSprung = zurueck ? (Number(nach) || 0) - (Number(heim.tagNull) || 0) : null;
        if (zurueck) await wolke("zurück in die Welt des Boots (switchToWorld)");
        if (!zurueck) rep.befunde.push("die Welt des Boots kehrt nicht zurück (switchToWorld)");
        else if (rep.tagSprung !== 0) rep.befunde.push(`Speichern + Laden: der Tag der Prozesse springt um ${rep.tagSprung} (tagNull ${heim.tagNull} → ${nach})`);
        // DER ALT-STAND (ohne Null-Punkt, von vor w28-lava-nachlauf): sein Laden eicht GENAU einmal — das erste Laden legt den
        // Null-Punkt, das zweite Laden desselben Stands lässt ihn stehen
        const alt = await page.evaluate(() => {
            const lade = (s) => (r._loadStateRestoreWorldMeta(s), r._loadStateRestoreSoulAndAtmosphere(s), r.state.worldMeta.tagNull);
            // der Stand trägt die Stunde, die die Welt hat (die Uhr über ihren Schreiber, nie ins Abbild geschrieben)
            r._uhrSetzen(0.375, "regler");
            const s = r.buildStateSnapshot();
            delete s.worldMeta.tagNull;
            const erst = lade(s);
            return { erst, zweit: lade(r.buildStateSnapshot()) };
        });
        rep.altStand = alt;
        if (!Number.isFinite(alt.erst) || alt.erst === 0 || alt.zweit !== alt.erst)
            rep.befunde.push(`der Alt-Stand eicht nicht genau einmal (erstes Laden ${alt.erst}, zweites ${alt.zweit})`);
        if (je.has(B) && JSON.stringify(je.get(B).wuchs.hoehen) === JSON.stringify(k0.wuchs.hoehen))
            rep.befunde.push(`die Saat ${B} wächst dieselben Höhen wie ${A} — die Saat wirkt nicht`);
        // die Zeile der Sonne sieht nur, wenn B an anderer Breite steht als A (gemessen: −48,288° gegen −50,514°)
        if (je.has(B) && !(Math.abs(je.get(B).sonne.breite - k0.sonne.breite) >= 1))
            rep.befunde.push(
                `die Saat ${B} steht an der Breite von ${A} (${k0.sonne.breite.toFixed(3)}°) — die Zeile der Sonne ist dort blind`
            );
        // B ≠ A je Stelle des Gedächtnisses (A′ = A prüft `pruefe` über dieselbe Saat)
        if (je.has(B))
            for (const [stelle, w] of Object.entries(k0.gedaechtnis))
                if (JSON.stringify(je.get(B).gedaechtnis[stelle]) === JSON.stringify(w))
                    rep.befunde.push(`${stelle}: die Saat ${B} trägt dasselbe wie ${A} — die Saat wirkt dort nicht`);
        rep.navigiert = navigationen > 0;
        if (rep.navigiert) rep.befunde.push("der Satz lud die Seite neu — der Wechsel am Ort brach");
    } catch (e) {
        rep.befunde.push(`ABBRUCH: ${e?.message || e}`);
    } finally {
        rep.ms = Date.now() - t0;
        rep.befunde = Array.from(new Set(rep.befunde));
        await ctx.close();
    }
    return rep;
}

hauptLauf(async () => {
    const tStart = Date.now();
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "standard", frist: 600000 });
    console.log("\n========= DIE WELTGRENZE — kein Feld von A reist nach B, keine Welt geht verloren =========");
    console.log(`  Baum: ${root}`);
    const berichte = [];
    let rot = false;
    const abs = absenz();
    if (abs.length) rot = true;
    console.log(
        `  ${abs.length ? "⛔" : "✓"} absenz             ${abs.length ? abs.length + " Befunde" : "ein Schreiber je Rolle (saveState, _weltAblegen), ein Reload (der Rückfall in _weltWechsel)"}`
    );
    for (const f of abs) console.log(`      ⛔ ${f}`);
    for (const weg of WEGE) {
        const rep = weg === "saat" ? await fahreSaat(browser, null) : await fahreWeg(browser, weg, null);
        berichte.push(rep);
        const gruen = rep.befunde.length === 0;
        if (!gruen) rot = true;
        const art = rep.navigiert
            ? "die Tür lud neu"
            : weg === "saat"
              ? `am Ort, Saaten ${rep.saaten.map((s) => s[1]).join(" → ")}, zweites Boot derselben Welt: ${rep.zweitBoot == null ? "ungemessen" : rep.zweitBoot + " Aufträge der Sonne an den Planet-Faden (der Anker aus dem Merker)"}`
              : weg === "laden"
              ? "blieb in der Seite"
              : weg === "ersetzen-quota"
                ? "kein Wechsel"
                : TUEREN.has(weg.split("-")[0])
                  ? "am Ort"
                  : "neu geladen";
        console.log(
            `  ${gruen ? "✓" : "⛔"} ${weg.padEnd(18)} ${art} · Boot ${rep.boot.join(" + ")} ms · ${(rep.ms / 1000).toFixed(1)} s${rep.erlaubt.length ? ` · Positiv-Liste ${rep.erlaubt.map((p) => p.split(".")[1]).join(", ")}` : ""} · ${gruen ? "0 Befunde" : rep.befunde.length + " Befunde"}`
        );
        for (const f of rep.befunde) console.log(`      ⛔ ${f}`);
    }
    let selbst = null;
    if (SELBSTTEST) {
        const spread = await fahreWeg(browser, "laden", "spread");
        const sperre = await fahreWeg(browser, "ersetzen", "sperre");
        const stand = await fahreWeg(browser, "reload", "stand");
        const namen = spread.befunde.filter((f) => f.startsWith("in der Seite: worldMeta."));
        const fenster = sperre.befunde.filter((f) => /zeigt der Aktiv-Zeiger|erwachte in/.test(f));
        const proto = stand.befunde.filter((f) => /_dslPositionsCache/.test(f));
        // die Scheine der Saat: die Geburt verwirft die Saat (die Welt trägt eine gewürfelte) · der Rausch-Strom der alten Welt bleibt
        const zufallRep = await fahreSaat(browser, "zufall,merker");
        // das Gedächtnis der alten Saat und die Geburt ohne Null-Punkt fahren in EINER Sitzung (zwei Scheine, je einer beim eigenen
        // Namen; das Gedächtnis fällt nur rot, wenn JEDE seiner Stellen beim Namen steht)
        const rauschRep = await fahreSaat(browser, "gedaechtnis,tagnull");
        const zufall = zufallRep.befunde.filter((f) => /worldMeta\.seed trägt w-[0-9a-f]{12}-\w+ statt der Saat grenze-saat-b/.test(f));
        const stellen = rauschRep.gedaechtnisNamen || [];
        const genannt = stellen.filter((n) => rauschRep.befunde.some((f) => f.includes(`${n} trägt ein Gedächtnis einer anderen Saat`)));
        const rausch = stellen.length === 11 && genannt.length === stellen.length ? genannt : [];
        const ungenannt = stellen.filter((n) => !genannt.includes(n));
        // die Ersatz-Saat zum Schein: eine Kopie der Eingangs-Saat im Stamm — die Absenz nennt sie beim Namen
        const schein8 = '\nconst x = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";\n';
        const ersatz = stammLib.fehlt(null, ERSATZ, { wandel: (t) => t + schein8 }) ? [] : [stammLib.fehlt.wo];
        const tagnull = rauschRep.befunde.filter((f) => /Saat grenze-saat-b\): worldMeta\.tagNull [-\d.e]+ statt 0 — die Welt trägt den Null-Punkt/.test(f));
        // ein Neubau im Fenster zum Schein: der Weg nennt ihn, UND der EINE Sammler sah seinen Wurf am Leser der Saat (`taeter` nimmt
        // ihn aus der Liste; leer hieße: der Leser bricht dort nicht mehr beim Namen — die Probe wäre an der Stelle blind)
        // dieselbe Sitzung trägt den Anker der Sonne je Seite (zwei Scheine, je einer beim eigenen Namen)
        const vorratRep = await fahreSaat(browser, "vorrat,anker");
        const wurf = taeter(/Die Saat der Welt fehlt/);
        const vorrat = wurf.length ? vorratRep.befunde.filter((f) => /_foundryRewarmColdTrees` \d+× vor dem Heil/.test(f)) : [];
        const merker = zufallRep.befunde.filter((f) => /zweites Boot derselben Welt: die Sonne weckte den Planet-Faden 1×/.test(f));
        const anker = vorratRep.befunde.filter((f) => /Saat grenze-saat-b\): die Sonne steht mittags .* stellt sie auf/.test(f));
        selbst = {
            spread: namen,
            sperre: fenster,
            stand: proto,
            zufall,
            gedaechtnis: rausch,
            tagnull,
            ersatz,
            vorrat,
            anker,
            merker,
            befunde: { vorrat: vorratRep.befunde, spread: spread.befunde, sperre: sperre.befunde, stand: stand.befunde, zufall: zufallRep.befunde, gedaechtnis: rauschRep.befunde, ersatz: [] },
        };
        console.log(
            `\n  SELBSTTEST 1 (der alte Spread am Lade-Engpass zum Schein): ${namen.length} Felder von A beim Namen — ${namen
                .map((f) => f.replace("in der Seite: ", ""))
                .slice(0, 6)
                .join(", ")}${namen.length > 6 ? " …" : ""}`
        );
        console.log(
            `  SELBSTTEST 2 (saveState ohne die Sperre des Welt-Wechsels zum Schein): ${fenster.length} Befunde — ${fenster.join(" · ")}`
        );
        console.log(`  SELBSTTEST 3 (der Prototyp trägt Stand zum Schein): ${proto[0] || "BLIND"}`);
        console.log(`  SELBSTTEST 4 (die Geburt verwirft die Saat des Spielers zum Schein): ${zufall[0] || "BLIND"}`);
        console.log(
            `  SELBSTTEST 5 (das Gedächtnis der alten Saat überlebt den Wechsel zum Schein): ${rausch.length ? `${rausch.length} von ${stellen.length} Stellen beim Namen` : `BLIND — ${stellen.length} Stellen, ungenannt: ${ungenannt.join(", ") || "—"}`}`
        );
        console.log(`  SELBSTTEST 6 (die Geburt ohne Null-Punkt zum Schein): ${tagnull[0] || "BLIND"}`);
        console.log(`  SELBSTTEST 8 (eine Ersatz-Saat neben dem EINEN Leser zum Schein): ${ersatz[0] || "BLIND"}`);
        console.log(
            `  SELBSTTEST 9 (ein Neubau im Tausch vor dem Heil zum Schein): ${vorrat[0] ? `${vorrat[0]} · der Sammler trug ${wurf.length}× den Wurf am Leser der Saat` : `BLIND — der Sammler trug ${wurf.length} Würfe am Leser der Saat`}`
        );
        console.log(`  SELBSTTEST 10 (der Anker der Sonne je Seite zum Schein): ${anker[0] || "BLIND"}`);
        console.log(`  SELBSTTEST 11 (der Merker des Ankers fällt mit der Welt zum Schein): ${merker[0] || "BLIND"}`);
    }
    if (JSON_AUS) jsonSchreiben(JSON_AUS, { root, absenz: abs, berichte, selbst });
    let pass;
    if (SELBSTTEST) {
        pass =
            !rot &&
            selbst &&
            selbst.spread.length > 0 &&
            selbst.sperre.length > 0 &&
            selbst.stand.length > 0 &&
            selbst.zufall.length > 0 &&
            selbst.gedaechtnis.length > 0 &&
            selbst.tagnull.length > 0 &&
            selbst.ersatz.length > 0 &&
            selbst.vorrat.length > 0 &&
            selbst.anker.length > 0 &&
            selbst.merker.length > 0;
        // DER BLINDE SCHEIN BEIM NAMEN (20.11., Probe 584c2060 an der OMEN: „ein Schein blieb unentdeckt“ — die Schlusszeile ist
        // alles, was der Probe-Post trägt, und sie nannte weder den Schein noch, was seine Fahrt stattdessen meldete; der Neulauf
        // war grün, der Täter blieb ungenannt): welcher der zehn blind blieb, und die ersten Befunde seiner Fahrt
        const blind = blindeScheine(selbst);
        // die Namens-Funktion an einem gestellten Fall: Schein 5 blind mit fremdem Befund, Schein 3 blind ohne Befund, der Rest gesehen
        const gestellt = blindeScheine({
            spread: [1],
            sperre: [1],
            stand: [],
            zufall: [1],
            gedaechtnis: [],
            tagnull: [1],
            ersatz: [1],
            vorrat: [1],
            anker: [1],
            merker: [1],
            befunde: { vorrat: [], spread: [], sperre: [], stand: [], zufall: [], gedaechtnis: ["x trägt y", "z", "w"], ersatz: [] },
        }).join(" | ");
        const gestelltSoll = "3 Prototyp trägt Stand — seine Fahrt meldete keinen Befund | 5 Gedächtnis der alten Saat überlebt den Wechsel — seine Fahrt meldete 3 andere Befunde: x trägt y · z";
        console.log(`  SELBSTTEST 7 (ein blinder Schein steht in der Schlusszeile beim Namen): ${gestellt === gestelltSoll ? gestellt : `FALSCH — ${gestellt}`}`);
        if (gestellt !== gestelltSoll) {
            pass = false;
            blind.push("7 die Namens-Funktion selbst");
        }
        console.log(
            `\n${pass ? "✅" : "⛔"} SELBSTTEST ${pass ? "GRÜN: auf keinem Weg trägt B ein Feld von A oder geht eine Welt verloren, jede Saat wächst in jedem Leser und jeder Stelle ihres Gedächtnisses — und alle zehn Scheine fallen rot beim Namen" : "ROT: " + (rot ? "der saubere Lauf ist schon rot" : `blind an Schein ${blind.join(" | ")} (die Linse sah ihn nicht)`)}`
        );
    } else {
        pass = !rot;
        console.log(
            `\n${pass ? "✅" : "⛔"} ${pass ? `Auf ${WEGE.length} von ${WEGE.length} Wegen trägt B 0 Felder von A, und keine Welt geht verloren` : "EIN WELT-ZUSTAND REIST ÜBER DIE WELTGRENZE ODER EINE WELT GEHT VERLOREN"}`
        );
    }
    console.log(`  Laufzeit ${((Date.now() - tStart) / 1000).toFixed(1)} s\n`);
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
});
