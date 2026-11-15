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
//   T11 DER VERKEHR KOSTET SCHIRM UND ÄNDERUNG (PFLICHT-OFFEN C, w4-verkehr-kosten): ein Wagen des Verkehrs 300 m fern fährt mit
//       dem EINEN Schritt des Verkehrs (`_verkehrSchritt`), der Spieler steht — er schreitet höchstens jeden 8. Sim-Schritt (die
//       Leiter `VERKEHR.leiter`; nie: vakuös), ist nie Beweger (`_blockerBewegt`: er zieht seinen Platz selbst nach — sonst
//       marschierte die Decken-Probe der Ego-Kamera `_ceilingHeadroom` je Bild, und `_blockerUmPlatz` gäbe ihn jeder Frage am
//       Spieler), sein neuer Stempel rechnet die Stau-Werke nicht neu (`AnazhRealm._stauBox`, Leser `_stauFelder` je Bild),
//       so wenig wie seine Ankunft (`_stauWorkClusters` ist am Stand der stauenden Bauten gemerkt, nie an der Länge der
//       Bau-Liste — bis w4-b-pflanzen warf jeder neue Eintrag die Werke, jeder gepflanzte Baum: am Damm bis 29 ms je Ruf).
//       Messort stadt (Null-Renderer, je Takt im Stand): Decke 0,42 ms und Stau 0,42 ms, bis die Wand stand.
//   T12 DIE EINE FRIST DER BAU-ARBEIT (w19-gang-hitch, profiband.K4): im Takt des Spielers fragt jeder Bauer die EINE Frist
//       (`_bauFrist`) — abgelaufen geht der Strom EIN Stück, die Pflanz-Schlange EINEN Wurf, das Abräumen EINEN Chunk, die Hüllen
//       EINE, und am Tor des Planers geht kein Job vorbei: der Pflicht-Gang gibt EINEM 0 ms. Bis hier trug jeder seine eigene Uhr (headless GT-Fahrt Genesis:
//       `_runFrameScheduler` 71,5 ms in EINEM Takt). Der Satz der Bauten (w25-stadt-takt-2) legt abgelaufen EIN Stück
//       (BAU_SATZ_STUECK) seiner Raten und seines Alters — bis dahin je Takt seinen eigenen Deckel von 8 192 Ecken NEBEN der Frist
//       (GTX, Messort stadt, erster Gang: `_tickBauSatz` 5,3 ms in der Takt-Mitte).
//   T13 NACH DER FRIST NUR DER EINE, REIHUM (w28-takt-frist, PFLICHT-OFFEN E): die Frist zählt ab dem Kopf des Takts
//       (`_fristStellen`); ist sie abgelaufen, geht am Tor (`_bauer`) je Takt EIN Bauer sein Pflicht-Stück (`_bauPflichtGang`),
//       der Hungrigste zuerst — vier Bauer mit Arbeit bauen in 12 Takten je 3 Stücke, keiner verhungert, und die Arbeit nach der
//       Frist steht je Bauer im Hauptbuch (`_bauHunger`: „Arbeit nach der Frist: <Bauer> X ms“). Bis hier ging JEDER der 17 Bauer
//       nach der Frist sein Stück (Radeon, Dorf im Gang: `_runFrameScheduler` 16,4 ms je Takt ab p95).
//   T15 DER VORBAU AM TOR (w28-preis-ort, Schnitt 3): der Vorbau der Bedienung ist ein Bauer der EINEN Frist (`_bauer("vorbau")`),
//       nie ein Ruf neben ihr; Rezeptbuch und Werkstatt bauen bei abgelaufener Frist je Ruf EIN Stück (`_rezeptBau`,
//       `_werkstattBau`). Bis hier lief er nach dem Bild am Tor vorbei (Radeon, Mess-Wiese 41ec3a96: Rezeptbuch 175,6 · Werkstatt
//       159,1 · Tuch-Gitter 159,0 ms in EINEM Bild).
//   T16 DIE SAAT FOLGT IHREM SAUM (w28-preis-ort, Heilung der Gegner): am echten Abräumen bleibt die Saat beim Pendeln um einen
//       Chunk, ihr Abschied fällt nach der Frist in SAAT_GEHT_MIN Würfen je Takt, Tritt und Marke gehen mit dem Chunk, die Probe der
//       Saat liest keine Marke (`_saatGeht`, `_saatGehtZuEnde`, `_saatGedaechtnisGeht`, `_vegetationSampleSpawn`).
//   T17 DAS TUCH-GITTER IM FADEN (w28-preis-ort, Heilung der Gegner): das Gitter des Voxel-Fadens (`_tuchGitterFaden`) gleicht dem
//       des Haupt-Fadens (koerper-core `tuchGitter`) Byte für Byte in jedem Feld.
// --selftest: der Wer-zuerst-fragt-Takt macht T3 rot, die Schwelle über das ganze Fenster
// T4, die FIFO-Pumpe und die FIFO-Freigabe T5, die Nur-der-Nächste-Wahl (Pumpe UND Freigabe) T6, die löschende Frist T8, die Kappe
// allein T9 (je Leser), der Wagen als Beweger, jede geschlossene Box als Damm und die Leiter ohne Sprosse T11 (je Leser), die
// Frist ohne Ende T12 (je Bauer), die zweite Uhr eines Bauers und das Tor ohne Hunger T13 (je Bauer), der Vorbau neben dem Tor
// und Rezeptbuch und Werkstatt am Stück T15 (je Täter), die Saat mit dem Boden, am Stück, mit Gedächtnis und die Probe an der Marke
// T16 (je Täter), der Faden ohne die Normale T17.
//
//   node scripts/diag-takt.cjs [--selftest]          (npm run gate:takt)
"use strict";
const PK = require("./lib/pack-kanon.cjs");
const { hauptLauf, SELBSTTEST } = require("./lib/welt-boot.cjs");

// Port über TAKT_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4563.

const PORT = Number(process.env.TAKT_PORT || 4563);
const SELBST = SELBSTTEST;

// T18 in der Seite: die Fahrt und ihre Mengen (siehe den Ruf unten). → { halte, diff, taeter }
async function t18Fahrt(selbst) {
    const P = AnazhRealm.prototype;
    const [X, Z, RAD] = [-280.4, -1045.6, 120];
    const stelle = (x, z) => {
        const y = r._voxelSurfaceY(x, z);
        pm.position.set(x, (Number.isFinite(y) ? y : 60) + 1.8, z);
    };
    const nah = (x, z) => (x - X) * (x - X) + (z - Z) * (z - Z) <= RAD * RAD;
    // die Saat steht (der Null-Renderer zeichnet kein Weltbild, `_weltSteht` kommt nie): kein Chunk-Bau, keine Pflanz-Schlange, kein
    // Chunk wartet auf Saat oder Plan, keine Saat geht, die Streu wartet nicht — zwanzig Takte in Folge
    const stehtSaat = async () => {
        let ruhig = 0;
        let n = 0;
        for (; n < 3000 && ruhig < 20; n++) {
            await __seitenTakt();
            const offen =
                (st.voxelMeshPending ? st.voxelMeshPending.size : 0) +
                (st.pendingVegSpawns ? st.pendingVegSpawns.length : 0) +
                (r._saatOffen ? r._saatOffen.size : 0) +
                (r._waldPflanzWarten ? r._waldPflanzWarten.size : 0) +
                (r._saatGehend ? r._saatGehend.size : 0) +
                (r._scatterRefillPending ? 1 : 0) +
                (r._streuWartet(pm.position, []) ? 1 : 0);
            ruhig = offen ? 0 : ruhig + 1;
        }
        if (ruhig < 20) throw new Error(`T18: die Saat steht nicht nach ${n} Takten`);
        return n;
    };
    const f = (v) => (+v).toFixed(2);
    const bestand = () => {
        const L = [];
        for (const e of st.architectures || []) {
            if (!e || !e.position || !nah(e.position.x, e.position.z)) continue;
            const k = e._ausGesetz === true ? (e.feldWurf === true ? "feld" : "gesetz") : e.werk ? "werk" : "sonst";
            L.push(`${k}|${e.type}|${f(e.position.x)},${f(e.position.z)}`);
        }
        for (const [, reg] of st.scatterRegions || [])
            for (const c of (reg && reg.cells) || [])
                if (c && nah(c.x, c.z)) L.push(`streu:${c.layer}|${c.species}/${c.variantIndex}|${f(c.x)},${f(c.z)}`);
        return L;
    };
    // die alte Klasse: der gewachsene Wurf des Felds setzt die Marke seiner Baum-Zelle (wann immer er aus der Schlange kommt)
    const zurueck = leihe(
        r,
        selbst
            ? {
                  spawnArchitecture(name, pos, opts, ...a) {
                      const e = P.spawnArchitecture.call(r, name, pos, opts, ...a);
                      const bp = e && typeof e === "object" && st.blueprints[e.type];
                      if (bp && bp._isGrown && e.feldWurf === true && !(opts && typeof opts._lodSpecies === "string"))
                          r._scatterMarkCellPromoted(e.position.x, e.position.z, "tree");
                      return e;
                  },
              }
            : {}
    );
    const halte = {};
    try {
        stelle(X, Z);
        halte.bootTakte = await stehtSaat();
        const boot = bestand();
        halte.boot = boot.length;
        // fern: bis die Saat der Wiese ging und ihre Streu-Regionen fielen
        stelle(X + 3000, Z);
        const { span } = r._voxelChunkConfig();
        const wiese = Math.floor(X / span) + "," + Math.floor(Z / span);
        let n = 0;
        for (; n < 600; n++) {
            await __seitenTakt();
            const Pop = st.voxelPopulatedChunks;
            const gehend = r._saatGehend ? r._saatGehend.size : 0;
            let streu = 0;
            for (const [, reg] of st.scatterRegions || []) for (const c of (reg && reg.cells) || []) if (c && nah(c.x, c.z)) streu++;
            if (!(Pop && Pop.has(wiese)) && !gehend && !streu) break;
        }
        halte.fernTakte = n;
        stelle(X, Z);
        halte.rueckTakte = await stehtSaat();
        const rueck = bestand();
        halte.rueck = rueck.length;
        // Pendeln ±90 m an der Chunk-Grenze, dreimal hin und her, 1,33 m je Takt (40 m/s bei 30 Bildern)
        const gx = -302.4;
        const ziele = [gx - 90, gx + 90, gx - 90, gx + 90, gx - 90, gx + 90, X];
        let x = X;
        for (const zx of ziele)
            while (Math.abs(zx - x) > 1e-6) {
                x += Math.sign(zx - x) * Math.min(1.33, Math.abs(zx - x));
                stelle(x, Z);
                await __seitenTakt();
            }
        halte.pendelTakte = await stehtSaat();
        const pendel = bestand();
        halte.pendel = pendel.length;
        const B = new Set(boot);
        const diff = { weg: [], neu: [] };
        for (const L of [rueck, pendel]) {
            const S = new Set(L);
            for (const t of boot) if (!S.has(t) && !diff.weg.includes(t)) diff.weg.push(t);
            for (const t of L) if (!B.has(t) && !diff.neu.includes(t)) diff.neu.push(t);
        }
        // der Täter je Abweichung: eine Zelle der Streu, in deren Baum-Zelle ein gewachsener Wurf des Felds steht, las die Marke
        const zelle = (x, z) => r._scatterCellKeyAt(x, z, "tree");
        const busch = new Set();
        for (const e of st.architectures || []) {
            const bp = e && e.position && st.blueprints[e.type];
            if (bp && bp._isGrown && e.feldWurf === true && e._waldDart !== true) busch.add(zelle(e.position.x, e.position.z));
        }
        const taeter = {};
        for (const t of [...diff.weg, ...diff.neu]) {
            const [k, , ort] = t.split("|");
            const [x0, z0] = ort.split(",").map(Number);
            const wer = /^streu/.test(k)
                ? busch.has(zelle(x0, z0))
                    ? "_streuWurf (liest die Marke des Felds)"
                    : "_streuRegion (der Platz der Region)"
                : k === "feld"
                  ? "_saatGeht (die Saat)"
                  : "unbenannt";
            taeter[wer] = (taeter[wer] || 0) + 1;
        }
        return { halte, diff: { weg: diff.weg.slice(0, 6), neu: diff.neu.slice(0, 6), n: diff.weg.length + diff.neu.length }, taeter };
    } finally {
        zurueck();
    }
}

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
            const nurNaechster = function (q, halter, darf) {
                // ohne Alters-Wache: der Nächste gewinnt immer
                let i = -1;
                for (let k = 0; k < q.length; k++) if ((!darf || darf(q[k])) && (i < 0 || this._foundryAuftragD2((q[k].rang || q[k]).wo) < this._foundryAuftragD2((q[i].rang || q[i]).wo))) i = k; // prettier-ignore
                return i;
            };
            const schlange = (wahl, lauf) => {
                const gesendet = [];
                const f = {
                    ready: true,
                    worker: { postMessage: (m) => gesendet.push(m) },
                    pending: new Map(),
                    reqSeq: 1,
                };
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
            const K = AnazhRealm.FOUNDRY_IM_FLUG;
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
                if (alt) r._foundryIngestQueue[0].t -= AnazhRealm.FOUNDRY_ALTER_MS + 1000; // der Älteste wartet über der Alters-Wache
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
                f.warte[0].t -= AnazhRealm.FOUNDRY_ALTER_MS + 1000; // der Älteste wartet über der Alters-Wache
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
                const f = {
                    ready: true,
                    worker: { postMessage: () => {} },
                    pending: new Map(),
                    reqSeq: 1,
                    cache: new Map(),
                };
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
                const f = {
                    ready: true,
                    worker: still,
                    helfer: [{ k: 1, bereit: true, w: still }],
                    pending: new Map(),
                    reqSeq: 1,
                };
                const zurueck = leihe(r, { _foundry: f, _foundryFrist: selbst ? fristAlt : fristGeist });
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
                    zurueck();
                }
            })();
            // T9 — die Kappen des Lade-Takts: im Lade-Takt arbeiten die Leser der Klasse bis zur EINEN Frist. Der Selbsttest
            // fährt die Kappe allein (`_ladeFrist` −∞).
            const t9 = await (async () => {
                const aus9 = { stromBau: 0, abschied: 0, satz: 0 };
                let zurueck = () => {};
                try {
                    // die Klasse in EREIGNIS-Zeit: jede Uhr-Frage ist 1 ms (die Frist = 100 Fragen), je Leser eine Aufgabe (`await`)
                    const stub = { _archIsRendered: (e) => !!e.t9, _rebuildArchitectureMesh: (e) => (e.t9 = !e.laedt), _populateVoxelChunkVegetation: () => aus9.laub++, _foundryPresetForEntry: (e) => e.dock || null }; // prettier-ignore
                    Object.assign(stub, { _voxelChunkConfig: () => ({ span: 16, ringRadius: 12 }), _voxelChunkLodFor: () => 0, _stufenZelle: () => 0, _ensureVoxelChunkAt: () => aus9.stromBau++, _fernRingEinhaengen: () => 0, _fernRingPunkt: () => ({ x: 0, z: 0, fuss: { ht: 0, hr: 0 }, rad: 0, s: 1 }), _fernAuftrag: () => new Promise(() => {}) }); // prettier-ignore
                    for (const k of "_setLastPlayerVoxelChunk _stufeAugeTakt _rebuildVoxelChunk _pruneDistantVoxelChunks _bedarfVoraus".split(" ")) stub[k] = () => {}; // prettier-ignore
                    const werk = { n: 0, liste: [], ox: 0, oz: 0, listeWerk: (function* () { while (++werk.n < 200) yield; })() }; // prettier-ignore
                    const wach = { n: 0, liste: [], lebt: true, wache: { stand: 1 }, wegeStand: 0 };
                    Object.assign(stub, { _bauFrist: () => Infinity, _disposeVoxelChunk: () => aus9.abschied++, _huellenBedarf: () => "alle", _huellenNach: null, _bauFristOhneEnde: () => false, _bewohnerSiedlungen: new Map([[1, wach], [0, werk]]), _bewohnerWechsel: () => null, _bewohnerStandPruefen: function* () { while (++wach.n < 9) yield; }, _bewohnerWegPruefen: () => (wach.n += 90), _bauSatzRate: (q) => (aus9.satz++, --q.n || st.bauSatzRaten.delete(q.key)), _satzAltertOffen: null, _satzAlterStempel: () => true, _satzBlockEcken: () => 0, _chunkSatzLege: (s, o, A, n) => (aus9.satz += n / AnazhRealm.BAU_SATZ_STUECK) }); // prettier-ignore
                    for (const k of "_ladeTakt _naturSetzen _spawnSettlementSlot _dorfTaktLebt _foliageChunkInRadius _foundryPlatzBereit _nebenFaden".split(" ")) stub[k] = () => true; // prettier-ignore
                    for (const k of "_standRuht _archKartenPreset _foundryEnabled _handBauErlaubt _archZiegelFern _foundryRewarmColdTrees _capNexusStructures _standMeldet _weltFeldAktiv".split(" ")) stub[k] = () => false; // prettier-ignore
                    if (selbst) stub._ladeFrist = () => -Infinity; // der Selbsttest: die Kappe allein
                    zurueck = leihe(r, stub);
                    const S = { weltTakt: 0, _frameOverBudget: false, playerMesh: { position: { x: 0, y: 0, z: 0 } }, architectureCullingRadius: 100, pendingVegSpawns: 0, architectures: 0, pendingFoliageChunks: 0, voxelChunks: 0, voxelTerrainActive: true, playerVel: null, bauSatzRaten: null, bauSatzSchmutzig: null, _weltbildDa: st._weltbildDa, chunkSaetze: st.chunkSaetze, archInstanceGroups: st.archInstanceGroups, _voxelStreamMaxPerFrame: 3, _voxelStreamBudgetMs: 1e9, fernRing: null }; // prettier-ignore
                    const [stAlt, qD, zwoelf] = [
                        Object.keys(S).map((k) => st[k]),
                        r._autoSettlementQueue,
                        [...Array(12).keys()],
                    ];
                    let [uhr, zurueck9] = [0, null];
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
                        aus9.bau = ((zurueck9 = leihe(r, { _bauFrist: () => r._ladeFrist() })), r.tickArchitectureCulling(), zurueck9(), st.architectures.filter((e) => e.t9).length); // prettier-ignore
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
                        st.fernRing = { flug: 0, auftrag: 0, cursor: 0, totalVerts: AnazhRealm.FERN_RING.scheibe * 40, einhaengen: [], gen: 0, anchorX: 0, anchorZ: 0 }; // prettier-ignore
                        Object.assign(aus9, { ring: zst._activeRingRadius, ringSoll: AnazhRealm.RING_EXIST_FLOOR, fern: (r._fernRingRefresh(), st.fernRing.flug), fernKappe: AnazhRealm.FERN_RING.scheibenImFlug }); // prettier-ignore
                        await null; // DER BODEN-STROM an der ms-Kappe (4 ms, Stück frei): bis zur Frist darüber, danach im selben Frame nur sie
                        [aus9.stromMs, aus9.stromMsGleich] = [strom(4, 1e9), strom(4, 1e9)];
                        // DER NAH-GANG außerhalb des Lade-Takts: 30 Ladende, die auf die Ankunfts-Generation warten, verbrauchen keinen Versuch,
                        // der Bau dahinter steht; 25 Ladende erschöpfen die Versuchs-Kappe, sie beendet nur das Bauen — die gedockte Stufe
                        // dahinter wird gesetzt. Der Selbsttest nimmt den 30 das Warten und der Stufe das Dock: beide stehen hinter der Kappe.
                        // Sie warten auf die HEUTIGE Generation des echten Werks (`fEcht.ankunft`, wie der Gang sie liest), nie auf eine feste
                        // 0: lieferte das Werk vor T9 einen Körper, wartete keiner der 30 mehr, sie fragten nach dem Gesetz neu, und die Wand
                        // nannte den Gang (z287 am Läufer 2/2 — 4 Kerne, EIN Werk-Faden; lokal mit 4 Kernen und CPU ×6 nachgestellt, auch an main).
                        [r._ladeTakt, r._foundryEnabled] = [() => false, () => true];
                        st.architectures = [...Array(57).keys()].map((i) => ({ position: { x: i + 1, z: 0 }, _ziegelGebacken: true, _nahWartet: i < 30 && !selbst ? { a: fEcht?.ankunft | 0, t: Infinity } : null, laedt: i !== 30 && i < 56, dock: i === 56 && !selbst })); // prettier-ignore
                        r.tickArchitectureCulling();
                        aus9.gang = [!!st.architectures[30].t9, !!st.architectures[56].t9];
                        // T12 — DIE EINE FRIST DER BAU-ARBEIT im Spiel-Takt (`_bauFrist` abgelaufen; der Selbsttest: ohne Ende): Planer, Strom,
                        // Pflanz-Schlange, Abräumen und Hüllen gehen je ihr erstes Stück
                        await null;
                        [r._bauFrist, r._huellenNach, st.voxelChunks] = [() => (selbst ? 1e9 : 0), new Set(zwoelf), new Map(zwoelf.map((i) => [i + ",0"]))]; // prettier-ignore
                        // DAS WERK DER BEWOHNER (w25-stadt-takt, `werk` im Stub): eine Liste im Nah-Ring rechnet als Job des Planers EIN
                        // Stück — bis dahin rechnete der Bewohner-Takt mit eigener Uhr (`listeMs`) neben der Frist
                        // DIE WACHE (w25-stadt-takt-3, `wach`): die Prüfung ihrer Stände ist ein Werk — der Takt der Leute leert sie nie
                        aus9.wache = (r._bewohnerWacheTakt?.(wach), wach.n);
                        // DER PLANER AM TOR (w28-takt-frist): die Frist des Takts ist abgelaufen — kein Job geht vorbei, der Pflicht-Gang gibt EINEM
                        // die Scheibe des Vortritts (0 = höchstens sie); das Werk der Bewohner geht als Leser mit 0 ms EIN Stück
                        const [P13, ohne12] = [AnazhRealm.prototype, leihe(r, { _bauFristOhneEnde: () => selbst })];
                        const tor12 = (jobs) => (
                            P13._fristStellen.call(r, uhr - 1e3, false),
                            r._dispatchFrameJobs(jobs).length || r._bauPflichtGang()
                        );
                        aus9.planer =
                            (tor12([{ name: "planer", prio: 1, run: (ms) => (aus9.planer12 = ms) }]),
                            aus9.planer12 <= AnazhRealm.TAKT_FRIST.vortritt ? 0 : aus9.planer12);
                        ohne12();
                        r._buildDeferrableJobs(st.playerMesh.position)
                            .find((j) => j.name === "bewohner")
                            .run(selbst ? 50 : 0);
                        AnazhRealm.prototype._pruneDistantVoxelChunks.call(r, { x: 1e5, z: 0 });
                        r._tickHuellenNach();
                        // DER SATZ (w25-stadt-takt-2): drei Raten zu je vier Stücken, das Alter einer Gruppe von acht — bis dahin legte er je
                        // Takt seinen eigenen Deckel (8 192 Ecken)
                        const g = { key: 9, satz: 9, liveCount: 1, mesh: { instanceMatrix: {} } };
                        [st.bauSatzRaten, st._weltbildDa, st.archInstanceGroups, r._satzAltertOffen] = [new Map([0, 1, 2].map((k) => [k, { key: k, d2: k, n: 4 }])), 1, new Map([[9, g]]), [{ g, i: 0, v: 0 }]]; // prettier-ignore
                        st.chunkSaetze = new Map([[9, { bloecke: new Map([[9, { vStart: 0, bau: { alter: 1, cnt: 1, n: 8 * AnazhRealm.BAU_SATZ_STUECK } }]]) }]]); // prettier-ignore
                        r._tickBauSatz();
                        aus9.raten = aus9.satz;
                        r._satzAltern();
                        // DER BAU-GANG (w25-stadt-takt-4): zwölf baubare Einträge, abgelaufen geht EIN Bau — bis dahin zählte er drei je Takt
                        st.architectures = zwoelf.map((i) => ({ position: { x: i + 1, z: 0 }, _ziegelGebacken: true }));
                        aus9.bau12b = (r.tickArchitectureCulling(), st.architectures.filter((e) => e.t9).length);
                        aus9.bau12 = [aus9.planer, strom(1e9, 1e9), pflanz() && r._tickPendingVegSpawns(8), aus9.abschied, 12 - r._huellenNach.size, werk.n, aus9.wache || wach.n, aus9.raten, aus9.satz - aus9.raten, aus9.bau12b]; // prettier-ignore
                        // T13 — NACH DER FRIST NUR DER EINE, REIHUM: vier Bauer mit Arbeit am Tor (jeder fragt die Frist, ein Stück ist eine
                        // Uhr-Frage), 12 Takte mit abgelaufener Frist — je Takt baut EINER seine Scheibe (3 Stücke). Der Selbsttest: jeder trägt
                        // eine zweite Uhr (9 ms ab seinem Beginn), und das Tor zählt keinen Hunger (der zuerst Gekommene geht immer)
                        const [namen13, stueck13, hungert13] = [
                            "strom waldPlan karte streuLod".split(" "),
                            {},
                            leihe(r, selbst ? { _bauHungert: () => {} } : {}),
                        ];
                        const bau13 = (w, wer, eigen = selbst ? uhr + 9 : 0, frist = P13._bauFrist.call(w, wer)) => { do stueck13[wer] = (stueck13[wer] | 0) + 1; while (++uhr < Math.max(frist, eigen)); }; // prettier-ignore
                        for (let i = ((r._bauHunger = new Map()), 0); i < 12; i++) [P13._fristStellen.call(r, uhr - 1e3, false), namen13.forEach((wer) => P13._bauer.call(r, wer, bau13, wer)), P13._bauPflichtGang.call(r)]; // prettier-ignore
                        aus9.satt13 = Object.fromEntries(
                            namen13.map((k) => [
                                k,
                                [stueck13[k] | 0, r._bauHunger.get(k).satt, +r._bauHunger.get(k).nachMax.toFixed(1)],
                            ])
                        );
                        [hungert13(), (r._bauFristTakt = null)];
                    } finally {
                        delete performance.now;
                        Object.keys(S).forEach((k, i) => (st[k] = stAlt[i]));
                        r._autoSettlementQueue = qD;
                    }
                    return aus9;
                } finally {
                    zurueck();
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
                        name: taub ? null : o?.name || null,
                        post: [],
                        postMessage: (m) => w.post.push(m && m.type),
                        terminate: () => {},
                    };
                    geboren.push(w);
                    return w;
                };
                const aus10 = {
                    geboren: false,
                    name: null,
                    post: [],
                    helfer: 0,
                    helferSoll: r._foundryFaedenZahl() - 1,
                };
                const zurueck = leihe(r, { _foundry: null, _foundryHelfer: selbst ? () => {} : r._foundryHelfer });
                try {
                    const f = r._ensureAssetFoundry();
                    await __weltDa(() => !!!(f && !f.worker));
                    aus10.geboren = !!f?.worker;
                    if (aus10.geboren) Object.assign(aus10, { name: f.worker.name, post: f.worker.post.slice() });
                    aus10.helfer = Math.max(0, geboren.length - 1);
                } finally {
                    window.Worker = WorkerEcht;
                    zurueck();
                }
                return aus10;
            })();
            // T11 — DER VERKEHR KOSTET SCHIRM UND ÄNDERUNG: eine Siedlung der Probe mit einem Wagen des Gesetzes 300 m fern (der
            // breiteste der Stadt, „suv": seine Boxen sind geschlossen — die alte Klasse staute an ihm) auf der geraden Linie seines
            // Fahrers; 240 Sim-Schritte des EINEN Verkehrs-Schritts, je Schritt seine Schritte (die Leiter), der Bestand der Beweger
            // (ihn lesen je Bild die Decken-Probe der Ego-Kamera `_ceilingHeadroom` und jede Platz-Frage `_blockerUmPlatz`) und der
            // Leser der Stau-Werke je Bild (`_stauFelder` fragt `_stauWorkClusters` nach Identität). Der Selbsttest fährt die alten
            // Klassen: der Wagen als Beweger (der Ruf ohne Drift), jede geschlossene Box als Damm, die Leiter ohne Sprosse.
            const t11 = await (async () => {
                const [C, P, o] = [AnazhRealm, Object.getPrototypeOf(r), { schritt: 0, beweger: 0, stau: 0 }];
                const S = {
                    raster: new Map(),
                    verkehr: { wagen: [], spurRaster: new Map(), zahl: AnazhRealm._verkehrZahl(1) },
                }; // die Zahlen aus ihrer EINEN Quelle
                const park = { x: pm.x + 300, z: pm.z, fahrt: Math.PI / 2 };
                const W = { S, park, gen: r._rollGenome("t11", "verkehr"), typ: "suv", fahrer: [], zonen: [], T: {}, dtAcc: 0, takt: 0 }; // prettier-ignore
                const zurueck = [leihe(r, { _bewohnerSiedlungen: new Map([[0, S]]), _wagenSchritt: (...a) => (o.schritt++, P._wagenSchritt.apply(r, a)), _blockerBewegt: selbst ? (e) => P._blockerBewegt.call(r, e) : P._blockerBewegt }), leihe(C, selbst ? { _stauBox: (a, z) => Math.min(a.maxX - a.minX, a.maxZ - a.minZ) >= z, VERKEHR: { ...C.VERKEHR, leiter: [[0, 1]] } } : {})]; // prettier-ignore
                try {
                    // die Werke des Staus vor der Ankunft des Wagens: weder sie noch ein Schritt rechnet sie neu
                    const c = r._stauWorkClusters();
                    if (r._verkehrWagenStellen(W)) S.verkehr.wagen.push(Object.assign(W, { zustand: "faehrt", F: r._fahrerLinie([park, { x: park.x + 160, z: park.z }], 4) })), (W.entry._verkehrFaehrt = true); // prettier-ignore
                    for (let i = 0; i < 240; i++) {
                        r._verkehrSchritt(1 / 60);
                        o.beweger += r._blockerNetz().beweger.has(W.entry);
                        o.stau += r._stauWorkClusters() !== c;
                    }
                    return o;
                } finally {
                    r._verkehrFort(S);
                    zurueck.forEach((z) => z());
                }
            })();
            // T14 — DIE RÄUMUNG AM ORT (w25-stadt-takt, `_grundrissWegeIn`): ein Kasten am nahen Dorf liest nur die Form der Siedlung,
            // deren Hülle ihn erreicht, nie die der fernen (1 und 2 km) — bis hier ging jede Räumung jede Form der Karte (Messort stadt:
            // 2 400 Formen je Kasten, das neue Dorf 23 ms in EINEM Takt). Der Selbsttest: jede Hülle ohne Rand.
            const t14 = (() => {
                const [R, o] = [AnazhRealm._wegeFormRadius, { n: 0 }];
                const zurueck = [leihe(st, { wegeKarte: { siedlungen: [0, 1e3, 2e3].map((x) => ({ x0: selbst ? -1e9 : x - 2, x1: selbst ? 1e9 : x + 6, z0: -2, z1: 2, formen: [{ typ: "segment", ax: x, az: 0, bx: x + 4, bz: 0, halb: 1 }] })) } }), leihe(AnazhRealm, { _wegeFormRadius: (f) => (o.n++, R(f)) })]; // prettier-ignore
                try {
                    r._grundrissWegeIn({ wege: new Map() }, -1, 1, -1, 1);
                } finally {
                    zurueck.forEach((z) => z());
                }
                return o.n;
            })();

            // T15 — DER VORBAU AM TOR (w28-preis-ort, Schnitt 3): der Vorbau der Bedienung geht nur durch das Tor der EINEN Frist
            // (`_bauer("vorbau")` im Planer oder als Pflicht-Stück) — zwölf echte Takte, jeder Ruf von `_vorbauBedienung` nennt,
            // durch welches Tor er kam; dazu bauen Rezeptbuch und Werkstatt bei abgelaufener Frist je Ruf EIN Stück (`_rezeptBau`,
            // `_werkstattBau`). Bis hier lief er nach dem Bild am Tor vorbei und baute beide am Stück (Radeon, Mess-Wiese: Rezeptbuch
            // 175,6 · Werkstatt 159,1 ms in EINEM Bild). Der Selbsttest fährt die alte Klasse: der Vorbau zusätzlich nach dem Planer,
            // Rezeptbuch und Werkstatt am Stück.
            const t15 = await (async () => {
                const P = AnazhRealm.prototype;
                const o = { rufe: 0, vorbei: 0, buch: 0, werk: 0, imBild: 0, zwischen: 0 };
                let tor = null;
                const zurueck = leihe(r, {
                    _vorbauBedienung: () => (o.rufe++, (o.vorbei += +(tor === null))),
                    _bauer(wer, lauf, a) {
                        const v = tor;
                        tor = wer;
                        try {
                            return P._bauer.call(this, wer, lauf, a);
                        } finally {
                            tor = v;
                        }
                    },
                    _bauPflichtGang() {
                        const v = tor;
                        tor = "pflicht";
                        try {
                            return P._bauPflichtGang.call(this);
                        } finally {
                            tor = v;
                        }
                    },
                    // die alte Klasse: der Vorbau läuft NEBEN dem Tor (nach dem Planer, wie bis Schnitt 3 nach dem Bild)
                    ...(selbst ? { _runFrameScheduler(...x) { const z = P._runFrameScheduler.apply(this, x); this._vorbauBedienung(); return z; } } : {}), // prettier-ignore
                    // die alte Klasse: Rezeptbuch und Werkstatt am Stück, gleich welche Frist
                    ...(selbst ? { _rezeptBau: () => P._rezeptBau.call(r, Infinity), _werkstattBau: () => P._werkstattBau.call(r, Infinity) } : {}), // prettier-ignore
                    // die alte Klasse: der Vorbau geht in jedem Takt, auch in dem, der zeichnet
                    ...(selbst ? { _vorbauDran: () => true } : {}),
                });
                try {
                    for (let i = 0; i < 12; i++) r._gameLoopTick(performance.now());
                    const host = document.getElementById("inventory-recipes");
                    if (host) {
                        [r._recipeBookSig, r._rezeptBauStand, host.innerHTML] = [null, null, ""];
                        while (!r._rezeptBau(performance.now() - 1) && o.buch < 1e4) o.buch++;
                        o.buch++;
                    }
                    r._werkstattBauStand = null;
                    while (!r._werkstattBau(performance.now() - 1) && o.werk < 1e3) o.werk++;
                    o.werk++;
                    // DER ZWISCHEN-TAKT (`_vorbauDran`): im Spiel (mit Ende) geht er in 30 Takten mit Bild nie, im Takt ohne Bild immer
                    const ohne = leihe(r, { _bauFristOhneEnde: () => false, _ladeTakt: () => false });
                    try {
                        r._vorbauBildTakte = 0;
                        for (let i = 0; i < 30; i++) o.imBild += +(P._fristStellen.call(r, performance.now(), true), r._vorbauDran()); // prettier-ignore
                        o.zwischen = +(P._fristStellen.call(r, performance.now(), false), r._vorbauDran());
                    } finally {
                        [ohne(), (r._bauFristTakt = null), (r._vorbauBildTakte = 0)];
                    }
                } finally {
                    zurueck();
                    r._renderWorkshopDOM();
                }
                return o;
            })();

            // T16 — DIE SAAT FOLGT IHREM SAUM (w28-preis-ort, Heilung der Gegner 15.11.): am echten Abräumen
            // (`_pruneDistantVoxelChunks`) bleibt die Saat beim Pendeln um EINEN Chunk (der Saum, Ring + 2), ihr Abschied fällt bei
            // abgelaufener Frist je Takt in `SAAT_GEHT_MIN` Würfen, ihre Gedächtnisse gehen mit dem Chunk (Tritt, Marke), und die Probe
            // der Saat liest keine Marke (`_vegetationSampleSpawn`). Bis hier ging sie mit dem Boden (Pendeln ±8 m: 115 Chunks
            // abgerissen), fiel am Stück im Bild des Abräumens (87 Abbauten 64,1 ms), ihr Gedächtnis wuchs mit dem Weg (Tritte
            // 4 814 → 31 919), und die Marke des ersten Besuchs nahm der Wiederkehr 6 von 46 Glutbrunnen. Der Selbsttest fährt die
            // alte Klasse je Täter.
            const t16 = (() => {
                const P = AnazhRealm.prototype;
                const st = r.state;
                const pm = st.playerMesh.position;
                const { span, ringRadius: R } = r._voxelChunkConfig();
                const [x0, z0] = [pm.x, pm.z];
                const [pcx, pcz] = [Math.floor(x0 / span), Math.floor(z0 / span)];
                const o = {
                    pendelGeht: -1,
                    wuerfe: 0,
                    raten: [],
                    restGeht: -1,
                    tritt: -1,
                    marke: -1,
                    markeGelesen: -1,
                };
                const zurueck = leihe(r, {
                    // die alte Klasse: die Saat geht mit dem Boden (kein Saum)
                    ...(selbst ? { _saatGeht: (a, b, R0, bl, s) => P._saatGeht.call(r, a, b, -3, bl, s) } : {}),
                    // die alte Klasse: der Abschied am Stück
                    ...(selbst ? { _saatGehtZuEnde: (k, g) => P._saatGehtZuEnde.call(r, k, g, Infinity, 0) } : {}),
                    // die alte Klasse: das Gedächtnis bleibt
                    ...(selbst ? { _saatGedaechtnisGeht: () => {} } : {}),
                });
                const abbau = { n: 0 };
                const saat = (e) => !!e && e._ausGesetz === true && e.feldWurf === true;
                const zurueckAbbau = leihe(r, { removeArchitecture: (e, ...a) => (saat(e) && abbau.n++, P.removeArchitecture.call(r, e, ...a)) }); // prettier-ignore
                const Pop = st.voxelPopulatedChunks || (st.voxelPopulatedChunks = new Set());
                const gehend = () => (r._saatGehend ? r._saatGehend.size : 0);
                try {
                    // die Saat steht im Ring + 1 um den Spieler (gepflanzt), zwölf Würfe des Felds im Chunk des Spielers (der echte Bau)
                    for (let dx = -(R + 1); dx <= R + 1; dx++)
                        for (let dz = -(R + 1); dz <= R + 1; dz++) Pop.add(pcx + dx + "," + (pcz + dz));
                    for (let i = 0; i < 12; i++) {
                        const p = { x: (pcx + 0.1 + 0.07 * i) * span, y: 0, z: (pcz + 0.5) * span };
                        const e = r.spawnArchitecture("stein_block", p, { silent: true, precise: true, ausGesetz: true, feldWurf: true, seed: 7 + i }); // prettier-ignore
                        if (e && typeof e === "object")
                            [e._ausGesetz, e.feldWurf, o.wuerfe] = [true, true, o.wuerfe + 1];
                    }
                    // 1) PENDELN um EINEN Chunk: nichts geht
                    const vor = Pop.size;
                    for (const dx of [span, 0, span, 0]) {
                        pm.x = x0 + dx;
                        r._pruneDistantVoxelChunks(pm);
                    }
                    o.pendelGeht = vor - Pop.size + gehend();
                    for (let i = 0; i < 400 && gehend(); i++) r._pruneDistantVoxelChunks(pm);
                    // 2) DAS GEDÄCHTNIS am Ort: ein Tritt und eine Marke unter dem Spieler
                    const T = r._trittSchwach || (r._trittSchwach = new Map());
                    const zm = AnazhRealm.TRITT.zelleM;
                    const tk = Math.floor(x0 / zm) + "," + Math.floor(z0 / zm);
                    T.set(tk, [0.9, 0]);
                    r._scatterMarkCellPromoted(x0, z0, "under");
                    const mk = r._scatterCellKeyAt(x0, z0, "under");
                    // 3) DER SPRUNG 3 km bei abgelaufener Frist: je Takt höchstens SAAT_GEHT_MIN Abbauten der Saat
                    pm.x = x0 + 3000;
                    const zurueckFrist = leihe(r, { _bauFrist: () => -Infinity });
                    try {
                        for (let i = 0; i < 6; i++) {
                            abbau.n = 0;
                            r._pruneDistantVoxelChunks(pm);
                            o.raten.push(abbau.n);
                        }
                    } finally {
                        zurueckFrist();
                    }
                    for (let i = 0; i < 400 && gehend(); i++) r._pruneDistantVoxelChunks(pm);
                    o.restGeht = gehend();
                    o.tritt = +T.has(tk);
                    o.marke = +st.scatterPromoted.has(mk);
                    T.delete(tk);
                    st.scatterPromoted.delete(mk);
                } finally {
                    [zurueckAbbau(), zurueck()];
                    [pm.x, pm.z] = [x0, z0];
                }
                // 4) DIE PROBE LIEST KEINE MARKE: zwanzig Proben (ohne Wahrzeichen) fragen die Marke ihrer Zelle nie
                const Q = st.pendingVegSpawns || (st.pendingVegSpawns = []);
                const q0 = Q.length;
                let gelesen = 0;
                const zurueckMarke = leihe(r, {
                    _scatterIsCellPromoted: (...a) => (gelesen++, P._scatterIsCellPromoted.apply(r, a)),
                    // die alte Klasse: die Probe fragt die Marke ihrer Zelle
                    ...(selbst ? { _vegetationSampleSpawn: (x, z, ...a) => (r._scatterIsCellPromoted(x, z, "tree") ? 0 : P._vegetationSampleSpawn.call(r, x, z, ...a)) } : {}), // prettier-ignore
                });
                try {
                    for (let i = 0, n = 0; n < 20 && i < 200; i++) {
                        const [x, z] = [Math.round(x0 + i * 4.32), Math.round(z0 + 3 * i)];
                        const seed = ((x * 73856093) ^ (z * 19349663)) >>> 0;
                        if ((seed % 1000) / 1000 < 0.014) continue; // ein Wahrzeichen urteilt vor jeder Marke
                        r._vegetationSampleSpawn(x, z, 10, seed, null, null);
                        n++;
                    }
                } finally {
                    [zurueckMarke(), (Q.length = q0)];
                }
                o.markeGelesen = gelesen;
                return o;
            })();

            // T17 — DAS GITTER IM FADEN GLEICHT DEM DES HAUPT-FADENS (w28-preis-ort, Heilung Gegner Gesetz F3): das Tuch-Gitter der
            // Tracht des Spielers, im Voxel-Faden gerechnet (`_tuchGitterFaden`, voxel-worker `tuch-gitter`), ist Byte für Byte das
            // Gitter des Haupt-Fadens (koerper-core `tuchGitter` an denselben Meshes) — zwei Wege zum selben Gitter, beide bewiesen. Der
            // Selbsttest reicht dem Faden die Normale nicht (ein Feld fehlt in der Kopie).
            const t17 = await (async () => {
                const p = r.state.playerMesh;
                const o = { tuch: false, felder: 0, anders: [] };
                if (!p || !r._tuchTeileVon(p)) return o;
                const u = p.userData;
                const satz = u._tuchTeile[u._gelenk.istFern ? "fern" : "nah"];
                if (!satz) return o;
                o.tuch = true;
                const { sim, folge } = satz;
                const haut = r._tuchHaut(p);
                const key = sim[0].userData.__tuchVorlage || sim[0].geometry;
                const haupt = globalThis.__koerperCore.tuchGitter(sim, folge, haut, r._tuchWebe(sim));
                const [memo0, flug0] = [AnazhRealm._tuchGitterMemo, AnazhRealm._tuchGitterFlug];
                [AnazhRealm._tuchGitterMemo, AnazhRealm._tuchGitterFlug] = [new WeakMap(), new WeakMap()];
                const P = AnazhRealm.prototype;
                const zurueck = leihe(r, selbst ? { _voxelFadenAuftrag: (w, m, tr) => (m.sim.forEach((s) => (s.nrm = null)), P._voxelFadenAuftrag.call(r, w, m, tr)) } : {}); // prettier-ignore
                let faden = null;
                try {
                    // das EINE Warten (`__weltDa`): bis der Faden das Gitter lieferte oder laut warf
                    await __weltDa(() => r._tuchGitterFaden(sim, folge, haut) === true || !!AnazhRealm._tuchGitterMemo.get(key)); // prettier-ignore
                    faden = AnazhRealm._tuchGitterMemo.get(key) || null;
                } finally {
                    zurueck();
                    [AnazhRealm._tuchGitterMemo, AnazhRealm._tuchGitterFlug] = [memo0, flug0];
                }
                const vergleiche = (a, b, pfad) => {
                    if (ArrayBuffer.isView(a) || ArrayBuffer.isView(b)) {
                        o.felder++;
                        const x = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
                        const y =
                            b && ArrayBuffer.isView(b) ? new Uint8Array(b.buffer, b.byteOffset, b.byteLength) : null;
                        if (!y || x.length !== y.length || x.some((v, i) => v !== y[i])) o.anders.push(pfad);
                        return;
                    }
                    if (a && typeof a === "object") {
                        for (const k of new Set([...Object.keys(a), ...Object.keys(b || {})])) vergleiche(a[k], b ? b[k] : undefined, pfad + "." + k); // prettier-ignore
                        return;
                    }
                    if (a !== b && !(Number.isNaN(a) && Number.isNaN(b))) o.anders.push(pfad);
                };
                if (faden) vergleiche(haupt, faden, "gitter");
                else o.anders.push("der Faden lieferte kein Gitter");
                return o;
            })();

            return {
                t17,
                t16,
                t15,
                t14,
                t11,
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
        // T18 — DIE RÜCKKEHR ZEIGT DENSELBEN BESTAND (w28-preis-ort, Heilung 2): eine eigene Fahrt der echten Welt (Takte des
        // Loops, Strom, Pflanz-Schlange, Streu) — Boot an der Mess-Wiese, Sprung 3 km, bis die Saat der Wiese ging, Rückkehr,
        // Pendeln ±90 m an der Chunk-Grenze x = −302,4; je Halt der Bestand binnen 120 m als Menge (Klasse, Art, Ort auf 1 cm):
        // jeder Eintrag der Welt und jede Zelle der Deko-Streu. Bis hier kehrte die Streu anders wieder (Kopf 5f7c0bf1, headless:
        // eine Birke weg, drei Bäume neu, alle in Baum-Zellen eines Buschs des Felds — die Marke `scatterPromoted` setzte der
        // Busch, sobald er aus der Schlange kam; die Streu las sie, wann immer ihre Region baute). Der Selbsttest fährt die alte
        // Klasse: der gewachsene Wurf des Felds setzt die Marke seiner Baum-Zelle.
        if (aus && !aus.fehler) aus.t18 = await realm.page.evaluate(t18Fahrt, SELBST);
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
    const T5 =
        t5.folge[0] === "eiche" && t5.folge[1] === "nah10" && t5.nummernSteigen && t5.imFlug === t5.K && T5i && T5a;
    const T6 = t6.folge.includes("alt") && t6.frei.slice(0, 2).includes("alt"); // Pumpe UND Freigabe: die EINE Wahl
    const t8 = aus.t8;
    // je Faden dieselbe Reihe: Werk (r1 → r3) und Helfer (rw1_2 → rw1_4); der Helfer-Faden trug wirklich zwei (nicht vakuös)
    const helferNr = (t8.nummern || []).filter((k) => /w1_\d+$/.test(k));
    const z8 = [t8.erster, t8.zweiter, t8.geist, helferNr, t8.helferErster, t8.helferZweiter, t8.helferGeist] + "";
    const T8 = helferNr.length === 2 && z8 === `abgelaufen,offen,true,${helferNr},abgelaufen,offen,true`;
    const t9 = aus.t9;
    // je Leser der Klasse (`_kappeOffen`) alle zwölf statt seiner Kappe, die Frist ein Vielfaches; die Frist gilt je Aufgabe
    const frist = { _tickPendingVegSpawns: t9.pflanz === 12, "_kappeOffen (Frist)": t9.ort >= 20, _tickAutoSettlement: t9.dorf === 12, tickArchitectureCulling: t9.bau === 12, _tickFoliageGrowth: t9.laub === 12, _tickVoxelChunkStreaming: t9.strom > 3 && t9.strom < 625 && t9.stromGleich === 3, "_tickVoxelChunkStreaming (ms)": t9.stromMs > 4 && t9.stromMs < 625 && t9.stromMsGleich > 0 && t9.stromMsGleich <= 4, _ringWaechst: t9.ring === t9.ringSoll, _fernRingRefresh: t9.fern > t9.fernKappe, _ladeFrist: t9.gleicherFrame === 4 && t9.ortAufgabe >= 20 }; // prettier-ignore
    const gang = t9.gang.every(Boolean);
    const T9 = !Object.values(frist).includes(false) && gang;
    const z9 = `${Object.keys(frist)}, Nah-Gang je ${[t9.pflanz, t9.ort, t9.dorf, t9.bau, t9.laub, t9.strom, t9.stromGleich, t9.stromMs, t9.stromMsGleich, t9.ring, t9.ringSoll, t9.fern, t9.fernKappe, t9.gleicherFrame, t9.ortAufgabe, t9.gang]}`; // prettier-ignore
    // T12 je Bauer beim Namen: abgelaufen sein erstes Stück (der Planer gibt seinem Job 0 ms)
    const N12 = "_dispatchFrameJobs _tickVoxelChunkStreaming _pflanzGang _pruneDistantVoxelChunks _tickHuellenNach _bewohnerWerkTakt _bewohnerWacheTakt _tickBauSatz _satzAltern tickArchitectureCulling".split(" "); // prettier-ignore
    const n12 = N12.filter((k, i) => (t9.bau12[i] === +!!i) === SELBST);
    // T13 je Bauer beim Namen [Stücke, längster Hunger, ms nach der Frist]: in 12 Takten 3 Scheiben zu 3 Stücken, höchstens 3 Takte
    // Hunger in Folge, nach der Frist EINE Scheibe (in der Uhr der Probe ≤ 5 ms) — wer mehr baut, trägt eine zweite Uhr; wer keine
    // bekommt, verhungert
    const n13 = Object.keys(t9.satt13).filter(
        (k, i, a, [n, satt, ms] = t9.satt13[k]) => (n === 9 && satt <= 3 && ms <= 5) === SELBST
    );
    const z13 = Object.entries(t9.satt13)
        .map(([k, [n, satt, ms]]) => `${k} ${n} Stücke · Hunger ${satt} · Arbeit nach der Frist: ${k} ${ms} ms`)
        .join(" | ");
    const z5 = [t5.K, t5.folge, t5.nummernSteigen, t5.imFlug, aus.t5i.frei[0], aus.t5i.n, aus.t5a.n, aus.t5a.erster];
    const t10 = aus.t10;
    const [z3, z6, z10] = [[t3.fernJa, t3.nah1, t3.nah2, t3.fern2, t3.fern3], `${t6.folge} · frei ${t6.frei}`, [t10.name, t10.post, t10.helfer, t10.helferSoll]]; // prettier-ignore
    const T14 = aus.t14 === 1; // die Räumung am Ort liest die EINE Form am Kasten
    // T15 je Täter beim Namen: der Vorbau kam in 12 Takten nur durchs Tor (mindestens einmal), Rezeptbuch und Werkstatt bauten bei
    // abgelaufener Frist in mehr als einem Stück
    const t15 = aus.t15;
    const T15je = {
        _vorbauBedienung: t15.rufe > 0 && t15.vorbei === 0,
        _rezeptBau: t15.buch > 1,
        _werkstattBau: t15.werk > 1,
        _vorbauDran: t15.imBild === 0 && t15.zwischen === 1,
    };
    const n15 = Object.keys(T15je).filter((k) => T15je[k] === SELBST);
    // T16 je Täter beim Namen: Pendeln um einen Chunk reißt nichts ab, je Takt nach der Frist höchstens SAAT_GEHT_MIN Abbauten (und
    // überhaupt welche), am Ende geht nichts mehr, Tritt und Marke des Orts fielen mit ihm, die Probe sät mit der Marke dasselbe
    const t16 = aus.t16;
    const T16je = {
        _saatGeht: t16.pendelGeht === 0,
        _saatGehtZuEnde:
            t16.wuerfe >= 8 && t16.raten.some((n) => n > 0) && t16.raten.every((n) => n <= 4) && t16.restGeht === 0,
        _saatGedaechtnisGeht: t16.tritt === 0 && t16.marke === 0,
        _vegetationSampleSpawn: t16.markeGelesen === 0,
    };
    const n16 = Object.keys(T16je).filter((k) => T16je[k] === SELBST);
    // T17 beim Namen: das Gitter des Fadens gleicht dem des Haupt-Fadens in jedem Feld (und es gibt eins)
    const t17 = aus.t17;
    const n17 = (t17.tuch && t17.felder > 0 && !t17.anders.length) === SELBST ? ["_tuchGitterFaden"] : [];
    const z17 = t17.tuch
        ? `${t17.felder} Felder, anders: ${t17.anders.slice(0, 4).join(", ") || "keins"}`
        : "der Spieler trägt kein Tuch";
    // T18 beim Namen: der Bestand der Rückkehr und des Pendelns gleicht dem Boot (Menge, 1 cm), und die Fahrt sah einen Bestand
    const t18 = aus.t18 || { halte: {}, diff: { n: -1, weg: [], neu: [] }, taeter: {} };
    const T18 = t18.halte.boot > 0 && t18.diff.n === 0;
    const n18 = T18 === SELBST ? (SELBST ? ["_streuWurf"] : Object.keys(t18.taeter).length ? Object.keys(t18.taeter) : ["unbenannt"]) : []; // prettier-ignore
    const z18 = `Boot ${t18.halte.boot} · Rückkehr ${t18.halte.rueck} · Pendeln ${t18.halte.pendel} (Takte Boot ${t18.halte.bootTakte} · fern ${t18.halte.fernTakte} · Rückkehr ${t18.halte.rueckTakte} · Pendeln ${t18.halte.pendelTakte}) · anders ${t18.diff.n}${t18.diff.n ? ` (weg ${t18.diff.weg.slice(0, 3).join(" ")} · neu ${t18.diff.neu.slice(0, 3).join(" ")}; ${JSON.stringify(t18.taeter)})` : ""}`; // prettier-ignore
    const z16 = `Pendeln ${t16.pendelGeht} Chunks gegangen · Abbauten je Takt nach der Frist ${t16.raten} · gehend am Ende ${t16.restGeht} · Tritt ${t16.tritt} Marke ${t16.marke} · ${t16.wuerfe} Würfe · die Probe las die Marke ${t16.markeGelesen}-mal`;
    const z15 = `${t15.rufe} Rufe, ${t15.vorbei} am Tor vorbei · Rezeptbuch in ${t15.buch} Stücken · Werkstatt in ${t15.werk} · im Bild-Takt ${t15.imBild}/30, im Zwischen-Takt ${t15.zwischen}/1`;
    const T10 = t10.geboren && t10.name === "buch" && !t10.post.includes("get-book") && t10.helfer === t10.helferSoll;
    // T11 je Leser beim Namen: die Leiter (vakuös ist ein ferner Wagen, der nie schreitet), der Beweger, der Stau — in der Wand
    // der Täter (rot), im Selbsttest der Vakuöse (grün unter der alten Klasse)
    const t11 = aus.t11;
    const T11je = {
        _verkehrSchritt: t11.schritt > 0 && t11.schritt <= 31,
        _blockerBewegt: !t11.beweger,
        _stauWorkClusters: !t11.stau,
    };
    const n11 = Object.keys(T11je).filter((k) => T11je[k] === SELBST);
    const z11 = `${t11.schritt}/240 Schritte · Beweger ${t11.beweger} · Stau ${t11.stau}`;
    if (SELBST) {
        const [v, vak] = [(x) => (x ? "vakuös" : "rot"), (n) => (n.length ? "vakuös: " + n : "rot")];
        const vakuoes = Object.keys(frist).filter((k) => frist[k]); // je Leser rot beim Namen, sonst geht er an `_kappeOffen` vorbei
        const ok = ![
            T3,
            T4,
            T5,
            T6,
            T8,
            T5i,
            T5a,
            T9,
            T10,
            T14,
            ...vakuoes,
            ...t9.gang,
            ...n11,
            ...n12,
            ...n13,
            ...n15,
            ...n16,
            ...n17,
            ...n18,
        ].some(Boolean);
        console.log(
            `${ok ? "✅" : "❌"} SELBST-TEST (je T die alte Klasse): T3 ${z3} ${v(T3)}; T4 ${v(T4)}; ` +
                `T5 ${z5} ${v(T5)}; T6 ${z6} ${v(T6)}; ` +
                `T8 ${z8} ${v(T8)}; T9 ${z9} ${v(T9)}${vakuoes.length ? ` — vakuös: ${vakuoes}` : ""}; ` +
                `T10 ${z10} ${v(T10)}; T11 ${z11} ${vak(n11)}; T12 ${t9.bau12} ${vak(n12)}; T13 ${z13} ${vak(n13)}; T14 ${aus.t14} ${v(T14)}; T15 ${z15} ${vak(n15)}; T16 ${z16} ${vak(n16)}; T17 ${z17} ${vak(n17)}; T18 ${z18} ${vak(n18)}`
        );
        process.exit(ok ? 0 : 1);
    }
    const zeile = (ok, text) => console.log(`  ${ok ? "✅" : "❌"} ${text}`); // EIN Drucker je Prüfzeile
    console.log("=== DIE TAKT-WAND ===");
    // die Werte: nah zuerst von 4 · nah1 → nah2 · fern2 · fern3 (T4: fern nie verhungert)
    zeile(T3, `T3 Feld-Bake nah zuerst: ${z3}`);
    zeile(T4, `T4 nie verhungert`);
    // T5 gesendet: der nachpriorisierte Schlüssel in 5 m, dann der Bau in 10 m; frei zuerst Soll e10 (am Ort des Spielers); der
    // Anhänger am Wächter ist ein naher Leser am fernen Zug (Soll 11 Ergebnisse) — der Täter: der eingefrorene Rang (_foundryNaeher
    // hebt nur die Wartenden)
    // die Werte: K + 10 → Folge · Nummer · Flug · frei/n · Anhänger und seine Nummer
    zeile(T5, `T5 Schlange: ${z5}${aus.t5a.erster === 10 ? "" : " — Täter _foundryNaeher"}`); // prettier-ignore
    zeile(T6, `T6 Worker-Schlange nie verhungert: ${z6}`);
    // die Werte: erster · zweiter · Geist, die Helfer-Nummern, ihr erster · zweiter · Geist
    zeile(
        T8,
        `T8 Geist im Faden: ${z8}` +
            // der Täter: die Nummer eines Helfer-Auftrags (w<k>_<n>) liest nicht, seine Uhr läuft ab dem Anmelden
            (T8 || t8.helferZweiter !== "abgelaufen" || t8.zweiter !== "offen" ? "" : " — Täter _foundryUhren")
    );
    // die Soll-Werte: Pflanz, Dorf, Bau, Laub je 12; Frist und Aufgabe ≥ 20; Strom 4–624 und gleich 3; ms 5–624 und gleich 1–4; Ring
    // = Soll; Fern > Kappe; Frame 4
    zeile(
        T9,
        `T9 Kappen: ${z9}` +
            // der Täter: Wartende verbrauchen Versuche oder die Kappe bricht den Nah-Gang ab (tickArchitectureCulling) — sonst gilt
            // bei ihm die Kappe je Takt unter dem Ladeschirm, nicht die EINE Frist des Lade-Frames (`_kappeOffen`)
            (T9 ? "" : ` — Täter ${gang ? Object.keys(frist).filter((k) => !frist[k]) : "tickArchitectureCulling"}`)
    );
    // die Werte: der Name, die Nachrichten, Helfer und ihr Soll
    zeile(
        T10,
        `T10 Faden: ${z10}` +
            // der Täter: die Buch-Frage reist nicht in der Geburt (Name „buch"), sie wartet auf den Haupt-Faden
            (T10 ? "" : " — Täter _ensureAssetFoundry")
    );
    // T11–T13 je Täter beim Namen: grün ohne, sonst hinter dem Befund (in T13 die Verhungerten)
    const benannt = (n, text) => zeile(!n.length, text + (n.length ? ` — Täter ${n}` : ""));
    benannt(n11, `T11 Verkehr: ${z11}`);
    benannt(n12, `T12 die EINE Frist: ${N12} je ${t9.bau12}`); // abgelaufen: je Bauer EIN Stück (`_bauFrist`)
    benannt(n13, `T13 der EINE, reihum: ${z13}`); // je Takt nach der Frist EIN Pflicht-Stück, der Hungrigste zuerst
    benannt(T14 ? [] : ["_grundrissWegeIn"], `T14 Räumung am Ort: ${aus.t14}`); // die Formen, die sie las
    benannt(n15, `T15 der Vorbau am Tor: ${z15}`); // je Takt durch das Tor der EINEN Frist, Buch und Werkstatt je Stück
    benannt(n17, `T17 das Tuch-Gitter im Faden gleicht dem Haupt-Faden: ${z17}`); // Byte für Byte, je Feld
    benannt(n16, `T16 die Saat folgt ihrem Saum: ${z16}`); // der Saum, der Abschied in Raten, die Gedächtnisse, die Probe ohne Marke
    benannt(n18, `T18 die Rückkehr zeigt denselben Bestand: ${z18}`); // Menge je Klasse, Art, Ort auf 1 cm: Boot = Rückkehr = Pendeln
    if (!(T3 && T4 && T5 && T6 && T8 && T9 && T10 && T14) || n11.concat(n12, n13, n15, n16, n17, n18).length) {
        console.error("\n❌ ROT");
        process.exit(1);
    }
    console.log("\n✅ GRÜN");
});
