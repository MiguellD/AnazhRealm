#!/usr/bin/env node
// diag-takt.cjs — DIE TAKT-WAND: ein Takt-Subsystem rechnet Teures nur für das, was es betrifft — nie je Takt für
// die ganze Welt. Das Gesetz ist eine ZÄHLUNG, keine Zeit (CI-fest). Den Brennglas-Takt (T1/T2, die Tags nur der Bauten in
// Reichweite) zählt seit feld-k2k3 allein gate:brennglas-takt (A) und (N): jeder Griff an einen Unbetroffenen, nicht nur die Tags.
//   T3  der Feld-Bake-Takt (`_weltBakeErlaubt`) geht NAH zuerst über alle Verbraucher: wer im Vor-Fenster nah abgewiesen
//       wurde, bekommt im nächsten zuerst (eine gesetzte Eiche in 170 m blieb sonst 200 Takte ohne Feld)
//   T4  und nie verhungert: was in der zweiten Fenster-Hälfte übrig ist, bekommt auch der Ferne (die Schwelle über das
//       ganze Fenster gab der fernen Eiche nie, 415 Freigaben in 1 000 Takten)
//   T5  DIE EINE WORKER-SCHLANGE (`_foundryAuftrag`) und ihre Freigabe wählen mit der EINEN Wahl (`_foundryWahl`) NAH zuerst:
//       hinter vollem Worker und zehn Vorrats-Aufträgen geht der nahe Bau als nächster hinein, ein wartender Vorrats-Schlüssel,
//       den ein naher Bau verlangt, wird nachpriorisiert, die Request-Nummer entsteht beim Senden; das Ergebnis am Ort des Spielers
//       geht zuerst frei; ein naher Leser, der sich an einen fernen Zug am Wächter hängt, hebt dessen EINEN Rang-Datensatz und
//       geht zuerst frei (B5, der Selbsttest friert ihn ein). T6 und nie verhungert: der Älteste (über FOUNDRY_ALTER_MS) geht unter
//       lauter Nahen spätestens als zweiter.
//   T8  der Abgelaufene bleibt im Faden (`_foundryFrist`): sein Besteller bekommt null, aber als Geist hält er Platz und Uhr
//       der Späteren, bis der Worker ihn fertig hat (sonst lief der Wiederholer ab, und der dritte Ablauf macht die Zelle
//       gescheitert); je FADEN, auch im Werk-Helfer (`w<k>_<n>`): die Uhr liest die Nummer am Ende, nie NaN (`_foundryUhren`)
//   T9  DIE KAPPEN DES LADE-TAKTS: unter dem Ladeschirm fragt jeder Leser des ersten Bilds mit Kappe je Takt die EINE Kappe
//       (`_kappeOffen`): Pflanz-Schlange, Dorf-Zug, Cull-Bau, Laub, Boden-Strom (Stück und ms, keine eigene Uhr) — bis zur EINEN Frist
//       je Lade-Frame (`_ladeFrist`); Ring-Boden und Fern-Ring (Lade-Takt) auch nach ihr; der Selbsttest nennt jeden vakuösen Leser.
//   T10 DER FADEN WARTET NIE AUF DEN HAUPT-FADEN (K60-2, B3a): die Buch-Frage reist IN der Geburt des Werks (Name „buch"), nie als
//       Nachricht (Chrome reicht sie erst weiter, wenn der volle Haupt-Faden „Skript gelaufen" liest); seine Helfer kommen mit ihm.
// --selftest: der Wer-zuerst-fragt-Takt macht T3 rot, die Schwelle über das ganze Fenster
// T4, die FIFO-Pumpe und die FIFO-Freigabe T5, die Nur-der-Nächste-Wahl (Pumpe UND Freigabe) T6, die löschende Frist T8, die Kappe
// allein T9 (je Leser).
//
//   node scripts/diag-takt.cjs [--selftest]          (npm run gate:takt)
"use strict";
const PK = require("./lib/pack-kanon.cjs");
const { hauptLauf, SELBSTTEST } = require("./lib/welt-boot.cjs");

// Port über TAKT_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4563.

const PORT = Number(process.env.TAKT_PORT || 4563);
const SELBST = SELBSTTEST;

hauptLauf(async () => {
    const realm = await PK.bootRealm(PORT);
    let aus;
    try {
        aus = await realm.page.evaluate(async (selbst) => {
            if (!r._buehneSteht()) return { fehler: "Bühne steht nicht" };
            // T3/T4 — der Feld-Bake-Takt: Fenster 1 verbrauchen ferne Fits das Budget, ein naher wird abgewiesen; im
            // Fenster 2 bekommt zuerst der nahe (T3), und was in der zweiten Fenster-Hälfte übrig ist, auch der ferne (T4).
            const werZuerst = function () {
                // die alte Klasse: wer im Fenster zuerst fragt, bekommt
                const j = performance.now();
                if (this._weltBakeFenster === undefined || j - this._weltBakeFenster > 1000) {
                    this._weltBakeFenster = j;
                    this._weltBakeN = 0;
                }
                if (this._weltBakeN >= (this.state._frameOverBudget ? 4 : 16)) return false;
                this._weltBakeN++;
                return true;
            };
            const ganzesFenster = function (d2) {
                // die Klasse: die Schwelle gilt das GANZE Fenster
                const D = Number.isFinite(d2) ? d2 : 0;
                const j = performance.now();
                if (this._weltBakeFenster === undefined || j - this._weltBakeFenster > 1000) {
                    this._weltBakeFenster = j;
                    this._weltBakeN = 0;
                    this._weltBakeVorrang = Number.isFinite(this._weltBakeHunger) ? this._weltBakeHunger : Infinity;
                    this._weltBakeHunger = Infinity;
                }
                if (this._weltBakeN >= (this.state._frameOverBudget ? 4 : 16) || D > this._weltBakeVorrang) {
                    if (!(D >= this._weltBakeHunger)) this._weltBakeHunger = D;
                    return false;
                }
                this._weltBakeN++;
                return true;
            };
            const folge = (erlaubt) => {
                const ueber = st._frameOverBudget;
                st._frameOverBudget = true;
                r._weltBakeFenster = undefined;
                r._weltBakeHunger = Infinity;
                const fern = 300 * 300,
                    nahD = 20 * 20;
                let fernJa = 0;
                for (let i = 0; i < 4; i++) if (erlaubt.call(r, fern)) fernJa++;
                const nah1 = erlaubt.call(r, nahD);
                r._weltBakeFenster = performance.now() - 2000; // das nächste Fenster
                const fern2 = erlaubt.call(r, fern);
                const nah2 = erlaubt.call(r, nahD);
                r._weltBakeFenster = performance.now() - 600; // dasselbe Fenster, zweite Hälfte
                const fern3 = erlaubt.call(r, fern);
                st._frameOverBudget = ueber;
                r._weltBakeFenster = undefined;
                r._weltBakeHunger = Infinity;
                return { fernJa, nah1, fern2, nah2, fern3 };
            };
            const a = folge(selbst ? werZuerst : r._weltBakeErlaubt);
            const b = selbst ? folge(ganzesFenster) : a;
            const t3 = { fernJa: a.fernJa, nah1: a.nah1, fern2: a.fern2, nah2: a.nah2, fern3: b.fern3 };
            // T5/T6 — die Worker-Schlange an einem Doppel-Worker (zeichnet die Sende-Reihenfolge auf; geantwortet wird
            // in Worker-Reihenfolge, danach pumpt der Host wie im onmessage) und ihre Freigabe; der Selbsttest tauscht die EINE Wahl.
            const pm = st.playerMesh.position;
            const fEcht = r._foundry;
            const fifo = (q, halter, darf) => (darf ? q.findIndex(darf) : 0); // die alte Klasse: jede in Ankunfts-Reihenfolge
            const nurNaechster = function (q, halter, darf) { // ohne Alters-Wache: der Nächste gewinnt immer
                let i = -1;
                for (let k = 0; k < q.length; k++) if ((!darf || darf(q[k])) && (i < 0 || this._foundryAuftragD2((q[k].rang || q[k]).wo) < this._foundryAuftragD2((q[i].rang || q[i]).wo))) i = k; // prettier-ignore
                return i;
            };
            const schlange = (wahl, lauf) => {
                const gesendet = [];
                const f = { ready: true, worker: { postMessage: (m) => gesendet.push(m) }, pending: new Map(), reqSeq: 1 };
                r._foundry = f;
                if (wahl) r._foundryWahl = wahl;
                const antworte = () => ((([id, res]) => (f.pending.delete(id), res([])))(f.pending.entries().next().value), r._foundryPumpe(f)); // prettier-ignore
                const bestelle = (name, wo) => r._foundryWorkerRequest(name, 0, 0, null, null, false, wo); // V18.527: ohne Saison
                try {
                    return lauf(f, gesendet, antworte, bestelle);
                } finally {
                    r._foundry = fEcht;
                    delete r._foundryWahl;
                }
            };
            const K = r.constructor.FOUNDRY_IM_FLUG;
            const t5 = schlange(selbst ? fifo : null, (f, gesendet, antworte, bestelle) => {
                for (let i = 0; i < K; i++) bestelle("block" + i); // der Worker ist voll
                const zug = (wo) => r._foundryZug("linse:t5:eiche", "eiche", 0, 0, undefined, wo); // der Zug des Vorrats-Schlüssels
                for (let i = 0; i < 10; i++) if (i === 4) zug(); else bestelle("vorrat" + i); // prettier-ignore
                bestelle("nah10", { x: pm.x + 10, z: pm.z });
                zug({ x: pm.x + 5, z: pm.z }); // ein naher Bau verlangt den Vorrats-Schlüssel (`_foundryZug` → `_foundryNaeher`)
                antworte();
                antworte();
                const nr = gesendet.map((m) => Number(String(m.reqId).replace(/^\D+/, "")));
                return { folge: gesendet.slice(K, K + 2).map((m) => m.presetId), nummernSteigen: nr.every((n, i) => i === 0 || n > nr[i - 1]), imFlug: f.pending.size, K }; // prettier-ignore
            });
            // DIE FREIGABE (`_tickFoundryIngest`, die EINE Wahl): Ergebnisse am Wächter, EIN Tick (3 frei) — ihre Reihe
            const freigabe = async (wahl, posten, alt) => {
                const [qE, frei, rE] = [r._foundryIngestQueue, [], st.renderer];
                [st.renderer, r._foundryIngestQueue] = [{}, []]; // headless hält der Wächter nichts — ein Renderer, synchron bis zum Zählen
                posten.forEach(([x, wo]) => r._foundryIngestTakt(x, wo).then((y) => frei.push(y)));
                if (alt) r._foundryIngestQueue[0].t -= r.constructor.FOUNDRY_ALTER_MS + 1000; // der Älteste wartet über der Alters-Wache
                const n = r._foundryIngestQueue.length;
                st.renderer = rE;
                if (wahl) r._foundryWahl = wahl;
                r._tickFoundryIngest(1 / 60);
                delete r._foundryWahl;
                await null;
                r._foundryIngestQueue = qE;
                return { n, frei };
            };
            const t6 = schlange(selbst ? nurNaechster : null, (f, gesendet, antworte, bestelle) => {
                for (let i = 0; i < K; i++) bestelle("block" + i);
                bestelle("alt");
                f.warte[0].t -= r.constructor.FOUNDRY_ALTER_MS + 1000; // der Älteste wartet über der Alters-Wache
                for (let i = 0; i < 6; i++) bestelle("nah" + i, { x: pm.x + 5 + i, z: pm.z });
                antworte();
                antworte();
                return { folge: gesendet.slice(K, K + 2).map((m) => m.presetId) };
            });
            // hinter 10 fernen Ergebnissen geht das am Ort des Spielers zuerst frei (B4-n1), der Älteste unter 6 Nahen spätestens als zweiter
            const t5i = await freigabe(selbst && fifo, [...Array(11).keys()].map((i) => ["e" + i, i < 10 ? { x: pm.x + 900 + i, z: pm.z } : pm])); // prettier-ignore
            // DER ANHÄNGER AM WÄCHTER (B5, Befund des B4-Prüfers): elf ferne Züge liegen am Wächter, ein naher Leser hängt sich an den
            // letzten (`_foundryZug` → `_foundryNaeher`) — dessen Rang-Datensatz steigt, er geht als erster frei; der Selbsttest friert ihn ein
            const t5a = await (async () => {
                const [fE, qE, rE, reihe] = [r._foundry, r._foundryIngestQueue, st.renderer, []];
                const f = { ready: true, worker: { postMessage: () => {} }, pending: new Map(), reqSeq: 1, cache: new Map() };
                try {
                    [r._foundry, st.renderer, r._foundryIngestQueue] = [f, {}, []]; // ein Renderer: der Wächter hält
                    if (selbst) r._foundryNaeher = () => {}; // der eingefrorene Rang: der Anhänger hebt nichts
                    const zug = (n, wo) => r._foundryZug("linse:t5a:" + n, "eiche", 0, 0, undefined, wo);
                    const wos = [...Array(11).keys()].map((i) => ({ x: pm.x + 900 + i, z: pm.z }));
                    const zuege = wos.map((wo, i) => zug("fern" + i, wo));
                    for (const [id, res] of [...f.pending]) f.pending.delete(id) && res([]);
                    await sleep(0);
                    // nur die eigenen Ergebnisse (die Welt liefert in denselben Wächter): am Datensatz, ohne ihn am Ort
                    const meine = r._foundryIngestQueue.map((e) => [e, zuege.findIndex((z, i) => (e.rang ? e.rang === z.rang : e.wo === wos[i]))]).filter(([, i]) => i >= 0); // prettier-ignore
                    meine.forEach(([e, i]) => ((f0) => (e.frei = () => (reihe.push(i), f0())))(e.frei));
                    zug("fern10", pm); // der nahe Leser hängt sich an den letzten Zug
                    for (let t = 0; t < 30 && reihe.length < meine.length; t++) r._tickFoundryIngest(1 / 60);
                    await sleep(0);
                    return { n: meine.length, erster: reihe[0] };
                } finally {
                    [r._foundry, st.renderer, r._foundryIngestQueue] = [fE, rE, qE];
                    delete r._foundryNaeher;
                }
            })();
            const t6i = await freigabe(selbst && nurNaechster, [["alt", { x: pm.x + 900, z: pm.z }], ...[0, 1, 2, 3, 4, 5].map((i) => ["nah" + i, { x: pm.x + 5 + i, z: pm.z }])], true); // prettier-ignore
            // T8 — der Abgelaufene bleibt im Faden: zwei Aufträge (Frist 600 ms) an einen Worker, der lange baut. Läuft der erste ab,
            // bekommt sein Besteller null, aber die Uhr des zweiten startet nicht, solange sein Geist Platz und Uhr hält (die alte
            // Frist löschte ihn); die Uhr startet am Ereignis (`_foundryUhren`), gemessen wird vor 600 + GEIST_FACH × 600 ms (2 s).
            const fristEcht = Object.prototype.hasOwnProperty.call(r, "_foundryFrist") ? r._foundryFrist : null;
            const fristGeist = r._foundryFrist;
            // die löschende Frist auf derselben Uhr: der Abgelaufene fällt sofort aus dem Faden, statt als Geist zu halten
            const fristAlt = function (f, reqId, dauerMs, beiAblauf) {
                fristGeist.call(this, f, reqId, dauerMs, () => {
                    f.pending.delete(reqId);
                    this._foundryUhren(f);
                    beiAblauf();
                });
            };
            // DER HELFER-FADEN: ein bereiter Werk-Helfer (`_foundryHelfer`) trägt seinen Faden in der Nummer (`rw1_2`);
            // die Pumpe legt die vier Aufträge abwechselnd in Werk und Helfer, je Faden gilt dieselbe Reihe. Die Uhr liest die
            // Nummer am ENDE — die Lesart vom Anfang (`/^\D+/`) machte aus `rw1_4` NaN, seine Uhr lief ab dem Anmelden.
            const t8 = await (async () => {
                const still = { postMessage: () => {} };
                const f = { ready: true, worker: still, helfer: [{ k: 1, bereit: true, w: still }], pending: new Map(), reqSeq: 1 };
                r._foundry = f;
                if (selbst) r._foundryFrist = fristAlt;
                const aus8 = { erster: "offen", zweiter: "offen", helferErster: "offen", helferZweiter: "offen" };
                try {
                    const auftrag = (name, k) =>
                        r
                            ._foundryAuftrag(f, "r", { type: "build-asset", presetId: name }, null, 600, "-")
                            .then((x) => (aus8[k] = x === null ? "abgelaufen" : "beantwortet"));
                    auftrag("lang", "erster");
                    auftrag("helfer-lang", "helferErster");
                    auftrag("dahinter", "zweiter");
                    auftrag("helfer-dahinter", "helferZweiter");
                    aus8.nummern = [...f.pending.keys()];
                    await sleep(2000);
                    // die Geister der ersten (r1, rw1_2) halten noch ihren Platz — die Welt läuft weiter und darf derweil
                    // eigene Aufträge an das Doppel stellen (spätere Nummern, sie berühren keine der Uhren)
                    aus8.geist = f.pending.has("r1");
                    aus8.helferGeist = f.pending.has("rw1_2");
                    return aus8;
                } finally {
                    r._foundry = fEcht;
                    if (fristEcht) r._foundryFrist = fristEcht;
                    else delete r._foundryFrist;
                }
            })();
            // T9 — die Kappen des Lade-Takts: im Lade-Takt arbeiten die Leser der Klasse bis zur EINEN Frist. Der Selbsttest
            // fährt die Kappe allein (`_ladeFrist` −∞).
            const t9 = await (async () => {
                const echt = {};
                const setze = (k, v) => {
                    echt[k] = Object.prototype.hasOwnProperty.call(r, k) ? r[k] : undefined;
                    r[k] = v;
                };
                const aus9 = { stromBau: 0 };
                try {
                    if (selbst) {
                        setze("_ladeFrist", () => -Infinity);
                    }
                    // die Klasse in EREIGNIS-Zeit: jede Uhr-Frage ist 1 ms (die Frist = 100 Fragen), je Leser eine Aufgabe (`await`)
                    const stub = { _archIsRendered: (e) => !!e.t9, _rebuildArchitectureMesh: (e) => (e.t9 = !e.laedt), _populateVoxelChunkVegetation: () => aus9.laub++, _foundryPresetForEntry: (e) => e.dock || null }; // prettier-ignore
                    Object.assign(stub, { _voxelChunkConfig: () => ({ span: 16, ringRadius: 12 }), _voxelChunkLodFor: () => 0, _stufenZelle: () => 0, _ensureVoxelChunkAt: () => aus9.stromBau++, _fernRingEinhaengen: () => 0, _fernRingPunkt: () => ({ x: 0, z: 0, fuss: { ht: 0, hr: 0 }, rad: 0, s: 1 }), _fernAuftrag: () => new Promise(() => {}) }); // prettier-ignore
                    for (const k of "_setLastPlayerVoxelChunk _stufeAugeTakt _rebuildVoxelChunk _pruneDistantVoxelChunks".split(" ")) stub[k] = () => {}; // prettier-ignore
                    for (const k of "_ladeTakt _naturSetzen _spawnSettlementSlot _dorfTaktLebt _foliageChunkInRadius _foundryPlatzBereit _nebenFaden".split(" ")) stub[k] = () => true; // prettier-ignore
                    for (const k of "_standRuht _archKartenPreset _foundryEnabled _handBauErlaubt _archZiegelFern _foundryRewarmColdTrees _capNexusStructures _standMeldet _weltFeldAktiv".split(" ")) stub[k] = () => false; // prettier-ignore
                    for (const k in stub) setze(k, stub[k]);
                    const S = { _frameOverBudget: false, playerMesh: { position: { x: 0, y: 0, z: 0 } }, architectureCullingRadius: 100, architectureBuildBudgetPerFrame: 3, pendingVegSpawns: 0, architectures: 0, pendingFoliageChunks: 0, voxelChunks: 0, voxelTerrainActive: true, playerVel: null, _voxelStreamMaxPerFrame: 3, _voxelStreamBudgetMs: 1e9, fernRing: null }; // prettier-ignore
                    const [stAlt, qD, zwoelf] = [Object.keys(S).map((k) => st[k]), r._autoSettlementQueue, [...Array(12).keys()]];
                    let uhr = 0;
                    performance.now = () => ++uhr;
                    try {
                        Object.assign(st, S, { pendingFoliageChunks: new Set(zwoelf.map((i) => i + ",0")), voxelChunks: new Map(zwoelf.map((i) => [i + ",0", {}])) }); // prettier-ignore
                        const pflanz = () => (st.pendingVegSpawns = zwoelf.map(() => ({ name: "-", position: {} })));
                        const ort = (k) => { for (aus9[k] = 0; r._kappeOffen(0, 0); ) aus9[k]++; }; // prettier-ignore
                        aus9.pflanz = pflanz() && r._tickPendingVegSpawns(4);
                        await null; // die nächste Aufgabe des Event-Loops trägt ihre EINE Frist
                        ort("ort");
                        aus9.gleicherFrame = pflanz() && r._tickPendingVegSpawns(4); // dieselbe Aufgabe: die Ort-Wahl trug sie aus
                        await null;
                        ort("ortAufgabe"); // eine Aufgabe ohne Frame des Loops (ein Zeitgeber)
                        await null;
                        r._autoSettlementQueue = r._dorfZug({ slots: Array(12).fill({}) }, { x: 0, z: 0 }, "-");
                        r._tickAutoSettlement({ x: 0, y: 0, z: 0 });
                        aus9.dorf = r._autoSettlementQueue ? r._autoSettlementQueue.idx : 12;
                        await null;
                        st.architectures = zwoelf.map(() => ({ position: { x: 0, z: 0 }, _ziegelGebacken: true }));
                        aus9.bau = (r.tickArchitectureCulling(), st.architectures.filter((e) => e.t9).length);
                        await null;
                        aus9.laub = 0;
                        r._tickFoliageGrowth();
                        await null; // DER BODEN-STROM (Kappe 3 Stück): bis zur Frist darüber, im selben Frame danach nur die Kappe
                        const strom = (ms = 1e9, n = 3) => { const n0 = aus9.stromBau; Object.assign(st, { voxelChunks: new Map(), _voxelStreamBudgetMs: ms, _voxelStreamMaxPerFrame: n }); r._tickVoxelChunkStreaming({ x: 0, y: 0, z: 0 }); return aus9.stromBau - n0; }; // prettier-ignore
                        [aus9.strom, aus9.stromGleich] = [strom(), strom()];
                        // RING-BODEN und FERN-RING (Lade-Takt, K60) nach der Frist: der Ring springt auf den Boden (`_ringWaechst`), der Fern-Ring fliegt (Selbsttest: die Drossel des Spiels)
                        const zst = Object.assign(Object.create(st), { renderer: {}, chunkRingRadius: 4, _activeRingRadius: null, voxelMeshPending: new Set([1]) }); // prettier-ignore
                        r._ringWaechst.call(Object.assign(Object.create(r), { state: zst, _ladeTakt: () => !selbst }));
                        r._ladeTakt = () => !selbst;
                        st.fernRing = { flug: 0, auftrag: 0, cursor: 0, totalVerts: r.constructor.FERN_RING.scheibe * 40, einhaengen: [], gen: 0, anchorX: 0, anchorZ: 0 }; // prettier-ignore
                        Object.assign(aus9, { ring: zst._activeRingRadius, ringSoll: r.constructor.RING_EXIST_FLOOR, fern: (r._fernRingRefresh(), st.fernRing.flug), fernKappe: r.constructor.FERN_RING.scheibenImFlug }); // prettier-ignore
                        await null; // DER BODEN-STROM an der ms-Kappe (4 ms, Stück frei): bis zur Frist darüber, danach im selben Frame nur sie
                        [aus9.stromMs, aus9.stromMsGleich] = [strom(4, 1e9), strom(4, 1e9)];
                        // DER NAH-GANG außerhalb des Lade-Takts: 30 Ladende, die auf die Ankunfts-Generation warten, verbrauchen keinen Versuch,
                        // der Bau dahinter steht; 25 Ladende erschöpfen die Versuchs-Kappe, sie beendet nur das Bauen — die gedockte Stufe
                        // dahinter wird gesetzt. Der Selbsttest nimmt den 30 das Warten und der Stufe das Dock: beide stehen hinter der Kappe.
                        [r._ladeTakt, r._foundryEnabled] = [() => false, () => true];
                        st.architectures = [...Array(57).keys()].map((i) => ({ position: { x: i + 1, z: 0 }, _ziegelGebacken: true, _nahWartet: i < 30 && !selbst ? { a: 0, t: Infinity } : null, laedt: i !== 30 && i < 56, dock: i === 56 && !selbst })); // prettier-ignore
                        r.tickArchitectureCulling();
                        aus9.gang = [!!st.architectures[30].t9, !!st.architectures[56].t9];
                    } finally {
                        delete performance.now;
                        Object.keys(S).forEach((k, i) => (st[k] = stAlt[i]));
                        r._autoSettlementQueue = qD;
                    }
                    return aus9;
                } finally {
                    r._foundry = fEcht;
                    for (const k of Object.keys(echt)) {
                        if (echt[k] === undefined) delete r[k];
                        else r[k] = echt[k];
                    }
                }
            })();
            // T10 — die Buch-Frage reist IN der Geburt des Werks (Name), seine Helfer kommen mit ihm; ein Schein-Faden hält Namen und
            // Nachrichten. Der Selbsttest fährt den alten Weg am Faden und am Helfer-Ruf (die Seite verbietet eval).
            const t10 = await (async () => {
                const WorkerEcht = window.Worker;
                const geboren = [];
                window.Worker = function (url, o) {
                    const taub = selbst && geboren.length === 0; // der alte Weg: die Geburt trägt keine Frage
                    const w = {
                        url,
                        name: taub ? null : (o && o.name) || null,
                        post: [],
                        postMessage: (m) => w.post.push(m && m.type),
                        terminate: () => {},
                    };
                    geboren.push(w);
                    return w;
                };
                const helferEcht = Object.prototype.hasOwnProperty.call(r, "_foundryHelfer") ? r._foundryHelfer : undefined; // prettier-ignore
                if (selbst) r._foundryHelfer = () => {};
                const aus10 = { geboren: false, name: null, post: [], helfer: 0, helferSoll: r._foundryFaedenZahl() - 1 };
                try {
                    r._foundry = null;
                    const f = r._ensureAssetFoundry();
                    await window.__weltDa(() => !!(!(f && !f.worker)));
                    aus10.geboren = !!(f && f.worker);
                    if (aus10.geboren) Object.assign(aus10, { name: f.worker.name, post: f.worker.post.slice() });
                    aus10.helfer = Math.max(0, geboren.length - 1);
                } finally {
                    window.Worker = WorkerEcht;
                    if (helferEcht === undefined) delete r._foundryHelfer;
                    else r._foundryHelfer = helferEcht;
                    r._foundry = fEcht;
                }
                return aus10;
            })();

            return {
                t10,
                t3,
                t5,
                t5i,
                t5a,
                t6: { ...t6, frei: t6i.frei },
                t8,
                t9,
            };
        }, SELBST);
    } finally {
        await realm.close();
    }
    if (!aus || aus.fehler) {
        console.error("❌ FEHLER:", aus ? aus.fehler : "keine Antwort");
        process.exit(1);
    }
    const t3 = aus.t3;
    const T3 = t3.fernJa === 4 && t3.nah1 === false && t3.nah2 === true && t3.fern2 === false;
    const T4 = t3.fern3 === true;
    const [t5, t6] = [aus.t5, aus.t6];
    const T5i = aus.t5i.n === 11 && aus.t5i.frei[0] === "e10"; // die Vorlagen des Leibs vor den Bäumen des Rings
    const T5a = aus.t5a.n === 11 && aus.t5a.erster === 10; // der Anhänger am Wächter geht zuerst frei (B5)
    const T5 = t5.folge[0] === "eiche" && t5.folge[1] === "nah10" && t5.nummernSteigen && t5.imFlug === t5.K && T5i && T5a;
    const T6 = t6.folge.includes("alt") && t6.frei.slice(0, 2).includes("alt"); // Pumpe UND Freigabe: die EINE Wahl
    const t8 = aus.t8;
    // je Faden dieselbe Reihe: Werk (r1 → r3) und Helfer (rw1_2 → rw1_4); der Helfer-Faden trug wirklich zwei (nicht vakuös)
    const helferNr = (t8.nummern || []).filter((k) => /w1_\d+$/.test(k));
    const T8 = t8.erster === "abgelaufen" && t8.zweiter === "offen" && t8.geist === true && helferNr.length === 2 && t8.helferErster === "abgelaufen" && t8.helferZweiter === "offen" && t8.helferGeist === true; // prettier-ignore
    const t9 = aus.t9;
    // je Leser der Klasse (`_kappeOffen`) alle zwölf statt seiner Kappe, die Frist ein Vielfaches; die Frist gilt je Aufgabe
    const frist = { _tickPendingVegSpawns: t9.pflanz === 12, "_kappeOffen (Frist)": t9.ort >= 20, _tickAutoSettlement: t9.dorf === 12, tickArchitectureCulling: t9.bau === 12, _tickFoliageGrowth: t9.laub === 12, _tickVoxelChunkStreaming: t9.strom > 3 && t9.strom < 625 && t9.stromGleich === 3, "_tickVoxelChunkStreaming (ms)": t9.stromMs > 4 && t9.stromMs < 625 && t9.stromMsGleich > 0 && t9.stromMsGleich <= 4, _ringWaechst: t9.ring === t9.ringSoll, _fernRingRefresh: t9.fern > t9.fernKappe, _ladeFrist: t9.gleicherFrame === 4 && t9.ortAufgabe >= 20 }; // prettier-ignore
    const gang = t9.gang.every(Boolean);
    const T9 = !Object.values(frist).includes(false) && gang;
    const t10 = aus.t10;
    const T10 = t10.geboren && t10.name === "buch" && !t10.post.includes("get-book") && t10.helfer === t10.helferSoll;
    if (SELBST) {
        const vakuoes = Object.keys(frist).filter((k) => frist[k]); // je Leser rot beim Namen, sonst geht er an `_kappeOffen` vorbei
        const ok = !T3 && !T4 && !T5 && !T6 && !T8 && !T5i && !T5a && !T9 && !vakuoes.length && !t9.gang.some(Boolean) && !T10;
        console.log(
            `${ok ? "✅" : "❌"} SELBST-TEST: der Wer-zuerst-fragt-Takt gibt Fenster 2 dem Fernen (${t3.fern2}) → T3 ${T3 ? "grün (vakuös!)" : "rot"}; ` +
                `die Schwelle über das ganze Fenster verweigert dem Fernen das übrige Budget (${t3.fern3}) → T4 ${T4 ? "grün (vakuös!)" : "rot"}; ` +
                `die FIFO-Pumpe sendet ${t5.folge.join("·")}, die FIFO-Freigabe gibt ${aus.t5i.frei[0]} zuerst, der eingefrorene Rang gibt den Anhänger als ${aus.t5a.erster === 10 ? "ersten (vakuös!)" : `Nr. ${aus.t5a.erster}`} → T5 ${T5 ? "grün (vakuös!)" : "rot"}; ` +
                `die Nur-der-Nächste-Wahl sendet ${t6.folge.join("·")}, gibt ${t6.frei.join("·")} frei → T6 ${T6 ? "grün (vakuös!)" : "rot"}; ` +
                `die löschende Frist lässt den Zweiten ablaufen (Werk ${t8.zweiter}, Helfer ${t8.helferZweiter}) → T8 ${T8 ? "grün (vakuös!)" : "rot"}; ` +
                `die Kappe allein (Pflanz ${t9.pflanz}, Ort ${t9.ort}, Dorf ${t9.dorf}, Bau ${t9.bau}, Laub ${t9.laub}, Strom ${t9.strom}/${t9.stromMs} ms, Ring-Boden ${t9.ring}, Fern-Ring ${t9.fern}, Nah-Gang ${t9.gang.join("/")}) → T9 ${T9 ? "grün (vakuös!)" : "rot"}${vakuoes.length ? ` — vakuös, an _kappeOffen vorbei: ${vakuoes.join(" · ")}` : ""}; ` +
                `der alte Weg gebiert das Werk ohne Frage (Name ${t10.name}, Helfer ${t10.helfer}/${t10.helferSoll}) → T10 ${T10 ? "grün (vakuös!)" : "rot"}`
        );
        process.exit(ok ? 0 : 1);
    }
    const zeile = (ok, text) => console.log(`  ${ok ? "✅" : "❌"} ${text}`); // EIN Drucker je Prüfzeile
    console.log("=== DIE TAKT-WAND — Takte rechnen nur die Betroffenen ===");
    zeile(T3, `T3 Feld-Bake-Takt nah zuerst: Fenster 1 fern ${t3.fernJa}/4 · nah ${t3.nah1} → Fenster 2 nah ${t3.nah2} · fern ${t3.fern2}`);
    zeile(T4, `T4 nie verhungert: zweite Fenster-Hälfte, übriges Budget → fern ${t3.fern3}`);
    zeile(T5, `T5 Worker-Schlange nah zuerst: nach ${t5.K} im Worker + 10 Vorrat gesendet ${t5.folge.join(" · ")} (der nachpriorisierte Schlüssel in 5 m, dann der Bau in 10 m) · Nummer beim Senden ${t5.nummernSteigen} · im Flug ${t5.imFlug} · die Freigabe gibt ${aus.t5i.frei[0]} von ${aus.t5i.n} zuerst frei (Soll e10, am Ort des Spielers) · der Anhänger am Wächter (ein naher Leser am fernen Zug, ${aus.t5a.n} Ergebnisse am Wächter, Soll 11) geht als ${aus.t5a.erster === 10 ? "erster" : `Nr. ${aus.t5a.erster} statt erster — Täter: der eingefrorene Rang (_foundryNaeher hebt nur die Wartenden)`} frei`);
    zeile(T6, `T6 Worker-Schlange nie verhungert: der Älteste unter 6 Nahen → ${t6.folge.join(" · ")} · die Freigabe → ${t6.frei.join(" · ")}`);
    zeile(T8, `T8 der Abgelaufene bleibt im Faden: erster ${t8.erster} · zweiter ${t8.zweiter} (seine Uhr wartet ` +
            `auf den Geist) · Geist des ersten im Faden ${t8.geist}; Helfer-Faden (${helferNr.join(" → ") || "leer"}): erster ` +
            `${t8.helferErster} · zweiter ${t8.helferZweiter} · Geist ${t8.helferGeist}` +
            (T8 || t8.helferZweiter !== "abgelaufen" || t8.zweiter !== "offen"
                ? ""
                : " — Täter _foundryUhren: die Nummer eines Helfer-Auftrags (w<k>_<n>) liest nicht, seine Uhr läuft ab dem Anmelden")
    );
    zeile(T9, `T9 die Kappen des Lade-Takts: ` +
            `Pflanz ${t9.pflanz}/12 · Frist ${t9.ort} Schritte · Dorf ${t9.dorf}/12 · Cull-Bau ${t9.bau}/12 · Laub ${t9.laub}/12 · im selben Frame ${t9.gleicherFrame}/4 · in eigener Aufgabe ${t9.ortAufgabe} · Boden-Strom ${t9.strom} (Kappe 3), danach im selben Frame ${t9.stromGleich}/3 · an der ms-Kappe ${t9.stromMs} (4 ms), danach ${t9.stromMsGleich} (≤ 4) · Ring-Boden ${t9.ring}/${t9.ringSoll} · Fern-Ring ${t9.fern} im Flug (Kappe ${t9.fernKappe}) · ` +
            `Nah-Gang (Bau hinter 30 Wartenden, Stufe hinter der Kappe) ${t9.gang.join(" · ")}` +
            (T9
                ? ""
                : !gang
                    ? " — Täter tickArchitectureCulling: Wartende verbrauchen Versuche oder die Kappe bricht den Nah-Gang ab"
                    : ` — Täter ${Object.keys(frist).filter((k) => !frist[k]).join(" · ")}: die Kappe je Takt gilt unter dem Ladeschirm, nicht die EINE Frist des Lade-Frames (_kappeOffen)`)
    );
    zeile(T10, `T10 der Faden wartet nie auf den Haupt-Faden: das Werk heißt ${t10.name}, als Nachricht fragt ${t10.post.join(" · ") || "nichts"}, ` +
            `Helfer ${t10.helfer}/${t10.helferSoll} geboren` +
            (T10
                ? ""
                : " — Täter _ensureAssetFoundry: die Buch-Frage reist nicht in der Geburt (Name „buch\"), sie wartet auf den Haupt-Faden")
    );
    if (!(T3 && T4 && T5 && T6 && T8 && T9 && T10)) {
        console.error("\n❌ ROT — ein Takt rechnet Teures für die ganze Welt.");
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Takt kostet, was ihn betrifft, nicht die Weltgröße.");
});
