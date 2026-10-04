#!/usr/bin/env node
// diag-takt.cjs — DIE TAKT-WAND (V18.512): ein Takt-Subsystem rechnet Teures nur für das, was es betrifft — nie je
// Takt für die ganze Welt. Befund 02.10. (Werkbank, `werkbank takt`, eingeschwungene Mess-Wiese, Render aus): der
// Spiel-Takt kostete p50 31 ms / p95 89 ms, davon Ø 20 ms (max 62 ms) in `_tickFocusingAffordances` — bei Sonne
// rechnete es für JEDEN der ~120 Bauten die Compound-Tags (`computeCompoundTags`), BEVOR es prüfte, ob überhaupt ein
// Brennglas in Reichweite steht. Nach dem Schnitt (Reichweite zuerst): p50 13 ms, p95 24 ms.
//
// Das Gesetz ist eine ZÄHLUNG, keine Zeit (CI-fest): in einer Welt mit 300 brennbaren Bauten und EINEM Brennglas
//   T1  steht kein Bau in seiner Reichweite → der Brennglas-Takt ruft computeCompoundTags 0-mal
//   T2  stehen 3 Bauten in Reichweite → je Takt höchstens 3 Rufe (genau die Betroffenen)
//   T3  der Feld-Bake-Takt (`_weltBakeErlaubt`) geht NAH zuerst über alle Verbraucher: wer im Vor-Fenster nah
//       abgewiesen wurde, bekommt im nächsten zuerst (Befund: das Streu-Gesetz fragte im Frame vor den Bauten —
//       eine gesetzte Eiche in 170 m blieb 200 Takte ohne Feld)
//   T4  und nie verhungert: was in der zweiten Fenster-Hälfte übrig ist, bekommt auch der Ferne (V18.512 hielt die
//       Schwelle das ganze Fenster: 415 Freigaben in 1 000 Takten, die ferne Eiche nie — gate:arch-feld mit echter
//       Distanz, 03.10.)
//   T5  DIE EINE WORKER-SCHLANGE (`_foundryAuftrag`) geht NAH zuerst: hinter vollem Worker (FOUNDRY_IM_FLUG) und zehn
//       Vorrats-Aufträgen in der Schlange geht der nahe Bau als nächster hinein, ein schon wartender Vorrats-Schlüssel,
//       den ein naher Bau verlangt, wird nachpriorisiert, und die Request-Nummer entsteht beim Senden (die EINE Frist
//       bleibt eine Arbeits-Uhr). Befund 03.10.: beim Boot 241 Aufträge im Worker, die nahe Eiche-L0 kam nach 9 s.
//   T6  und nie verhungert: ist der älteste Wartende älter als FOUNDRY_ALTER_MS, geht er unter lauter Nahen spätestens
//       als zweiter hinein.
// --selftest: ein Takt, der wieder die Tags ALLER Bauten rechnet (die alte Reihenfolge), macht T1 rot; der alte
// Wer-zuerst-fragt-Takt macht T3 rot; die Schwelle über das ganze Fenster macht T4 rot; die FIFO-Pumpe macht T5 rot,
// die Nur-der-Nächste-Pumpe T6.
//
//   node scripts/diag-takt.cjs [--selftest]          (npm run gate:takt)
"use strict";
const PK = require("./lib/pack-kanon.cjs");

const PORT = Number(process.env.DIAG_PORT || 4563);
const SELBST = process.argv.includes("--selftest");

(async () => {
    const realm = await PK.bootRealm(PORT);
    let aus;
    try {
        aus = await realm.page.evaluate(async (selbst) => {
            const r = window.anazhRealm;
            const st = r.state;
            st.weather = "sunny";
            if (typeof r._buehneSteht === "function" && !r._buehneSteht()) return { fehler: "Bühne steht nicht" };
            const typ = "baum_eiche";
            if (!st.blueprints[typ]) return { fehler: "kein " + typ };
            const tags = r.computeCompoundTags(st.blueprints[typ]);
            if (!((tags.brennbar || 0) >= r.constructor.BRENNBAR_TAG_MIN))
                return { fehler: typ + " ist nicht brennbar" };
            // 300 brennbare Bauten weit vom Brennglas, das Brennglas selbst bei (2000, 2000).
            const bauten = [];
            for (let i = 0; i < 300; i++) {
                const x = 400 + (i % 20) * 9,
                    z = 400 + Math.floor(i / 20) * 9;
                bauten.push(r.spawnArchitecture(typ, { x, y: 0, z }, { rotationY: 0 }));
            }
            const glas = r.spawnArchitecture(typ, { x: 2000, y: 0, z: 2000 }, { rotationY: 0 });
            if (!glas) return { fehler: "Brennglas nicht gesetzt" };
            glas.affordances = Object.assign({}, glas.affordances || {}, { focusing: true });
            // Zählung: computeCompoundTags-Rufe, die AUS dem Brennglas-Takt kommen.
            let imTakt = false,
                rufe = 0;
            const roh = r.computeCompoundTags;
            r.computeCompoundTags = function (bp) {
                if (imTakt) rufe++;
                return roh.call(this, bp);
            };
            const takt = r._tickFocusingAffordances;
            const tick = selbst
                ? function (dt) {
                      // Die alte Klasse: Tags aller Bauten vor jeder Reichweiten-Prüfung.
                      for (const t of this.state.architectures) {
                          const bp = this.state.blueprints[t.type];
                          if (bp) this.computeCompoundTags(bp);
                      }
                      return takt.call(this, dt);
                  }
                : takt;
            const lauf = (n) => {
                rufe = 0;
                for (let i = 0; i < n; i++) {
                    imTakt = true;
                    try {
                        tick.call(r, 0.001); // dt winzig: keine Zündung, nur der Takt
                    } finally {
                        imTakt = false;
                    }
                }
                return rufe;
            };
            const t1 = lauf(10);
            // T2: drei brennbare Bauten neben das Brennglas.
            const nah = [];
            for (let i = 0; i < 3; i++)
                nah.push(r.spawnArchitecture(typ, { x: 2000 + 1 + i, y: 0, z: 2000 }, { rotationY: 0 }));
            const t2 = lauf(10);
            r.computeCompoundTags = roh;
            for (const e of bauten.concat(nah, [glas])) if (e) r.removeArchitecture(e);
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
                // die V18.512-Klasse: die Schwelle gilt das GANZE Fenster
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
            // in Worker-Reihenfolge, danach pumpt der Host wie im onmessage).
            const pm = st.playerMesh.position;
            const fEcht = r._foundry;
            const pumpeEcht = Object.prototype.hasOwnProperty.call(r, "_foundryPumpe") ? r._foundryPumpe : null;
            const fifo = function (f) {
                // die alte Klasse: der Worker bekam jede Anfrage in Ankunfts-Reihenfolge
                const q = f.warte;
                while (q.length && f.pending.size < this.constructor.FOUNDRY_IM_FLUG) {
                    const x = q.shift();
                    const id = x.praefix + f.reqSeq++;
                    f.pending.set(id, x.resolve);
                    f.worker.postMessage(Object.assign({ reqId: id }, x.msg));
                }
            };
            const nurNaechster = function (f) {
                // ohne Alters-Wache: der Nächste gewinnt immer
                const q = f.warte;
                while (q.length && f.pending.size < this.constructor.FOUNDRY_IM_FLUG) {
                    let i = 0;
                    for (let k = 1; k < q.length; k++)
                        if (this._foundryAuftragD2(q[k].wo) < this._foundryAuftragD2(q[i].wo)) i = k;
                    const x = q.splice(i, 1)[0];
                    const id = x.praefix + f.reqSeq++;
                    f.pending.set(id, x.resolve);
                    f.worker.postMessage(Object.assign({ reqId: id }, x.msg));
                }
            };
            const schlange = (pumpe, lauf) => {
                const gesendet = [];
                const f = { ready: true, worker: { postMessage: (m) => gesendet.push(m) }, pending: new Map(), reqSeq: 1 };
                r._foundry = f;
                if (pumpe) r._foundryPumpe = pumpe;
                const antworte = () => {
                    const [id, res] = f.pending.entries().next().value;
                    f.pending.delete(id);
                    res([]);
                    r._foundryPumpe(f);
                };
                const bestelle = (name, wo) => r._foundryWorkerRequest(name, 0, 0, null, null, false, wo); // V18.527: ohne Saison
                try {
                    return lauf(f, gesendet, antworte, bestelle);
                } finally {
                    r._foundry = fEcht;
                    if (pumpeEcht) r._foundryPumpe = pumpeEcht;
                    else delete r._foundryPumpe;
                }
            };
            const K = r.constructor.FOUNDRY_IM_FLUG;
            const t5 = schlange(selbst ? fifo : null, (f, gesendet, antworte, bestelle) => {
                for (let i = 0; i < K; i++) bestelle("block" + i); // der Worker ist voll
                for (let i = 0; i < 10; i++) bestelle(i === 4 ? "eiche" : "vorrat" + i);
                bestelle("nah10", { x: pm.x + 10, z: pm.z });
                r._foundryNaeher(f, "eiche", 0, 0, { x: pm.x + 5, z: pm.z }); // ein naher Bau verlangt den Vorrats-Schlüssel
                antworte();
                antworte();
                const nr = gesendet.map((m) => Number(String(m.reqId).replace(/^\D+/, "")));
                return {
                    folge: gesendet.slice(K, K + 2).map((m) => m.presetId),
                    nummernSteigen: nr.every((n, i) => i === 0 || n > nr[i - 1]),
                    imFlug: f.pending.size,
                    K,
                };
            });
            const t6 = schlange(selbst ? nurNaechster : null, (f, gesendet, antworte, bestelle) => {
                for (let i = 0; i < K; i++) bestelle("block" + i);
                bestelle("alt");
                f.warte[0].t -= r.constructor.FOUNDRY_ALTER_MS + 1000; // der Älteste wartet über der Alters-Wache
                for (let i = 0; i < 6; i++) bestelle("nah" + i, { x: pm.x + 5 + i, z: pm.z });
                antworte();
                antworte();
                return { folge: gesendet.slice(K, K + 2).map((m) => m.presetId) };
            });
            return { t1, t2, t3, t5, t6, n: bauten.length, reichweite: r.constructor.FOCUSING_HEAT_RANGE_M };
        }, SELBST);
    } finally {
        await realm.close();
    }
    if (!aus || aus.fehler) {
        console.error("❌ FEHLER:", aus ? aus.fehler : "keine Antwort");
        process.exit(1);
    }
    const T1 = aus.t1 === 0;
    const T2 = aus.t2 <= 3 * 10;
    const t3 = aus.t3;
    const T3 = t3.fernJa === 4 && t3.nah1 === false && t3.nah2 === true && t3.fern2 === false;
    const T4 = t3.fern3 === true;
    const t5 = aus.t5,
        t6 = aus.t6;
    const T5 = t5.folge[0] === "eiche" && t5.folge[1] === "nah10" && t5.nummernSteigen && t5.imFlug === t5.K;
    const T6 = t6.folge.includes("alt");
    if (SELBST) {
        const ok = !T1 && !T3 && !T4 && !T5 && !T6;
        console.log(
            `${ok ? "✅" : "❌"} SELBST-TEST: der Takt mit den Tags ALLER Bauten ruft ${aus.t1}× in 10 Takten → T1 ${T1 ? "grün (vakuös!)" : "rot"}; ` +
                `der Wer-zuerst-fragt-Takt gibt Fenster 2 dem Fernen (${t3.fern2}) → T3 ${T3 ? "grün (vakuös!)" : "rot"}; ` +
                `die Schwelle über das ganze Fenster verweigert dem Fernen das übrige Budget (${t3.fern3}) → T4 ${T4 ? "grün (vakuös!)" : "rot"}; ` +
                `die FIFO-Pumpe sendet ${t5.folge.join("·")} → T5 ${T5 ? "grün (vakuös!)" : "rot"}; ` +
                `die Nur-der-Nächste-Pumpe sendet ${t6.folge.join("·")} → T6 ${T6 ? "grün (vakuös!)" : "rot"}`
        );
        process.exit(ok ? 0 : 1);
    }
    console.log("=== DIE TAKT-WAND — der Brennglas-Takt rechnet nur die Betroffenen ===");
    console.log(
        `  ${T1 ? "✅" : "❌"} T1 ${aus.n} Bauten, keiner in Reichweite: ${aus.t1} Tag-Rufe in 10 Takten (Soll 0)`
    );
    console.log(
        `  ${T2 ? "✅" : "❌"} T2 3 Bauten in Reichweite (${aus.reichweite} m): ${aus.t2} Tag-Rufe in 10 Takten (≤ 30)`
    );
    console.log(
        `  ${T3 ? "✅" : "❌"} T3 Feld-Bake-Takt nah zuerst: Fenster 1 fern ${t3.fernJa}/4 · nah ${t3.nah1} → Fenster 2 nah ${t3.nah2} · fern ${t3.fern2}`
    );
    console.log(`  ${T4 ? "✅" : "❌"} T4 nie verhungert: zweite Fenster-Hälfte, übriges Budget → fern ${t3.fern3}`);
    console.log(
        `  ${T5 ? "✅" : "❌"} T5 Worker-Schlange nah zuerst: nach ${t5.K} im Worker + 10 Vorrat gesendet ${t5.folge.join(" · ")} (der nachpriorisierte Schlüssel in 5 m, dann der Bau in 10 m) · Nummer beim Senden ${t5.nummernSteigen} · im Flug ${t5.imFlug}`
    );
    console.log(`  ${T6 ? "✅" : "❌"} T6 Worker-Schlange nie verhungert: der Älteste unter 6 Nahen → ${t6.folge.join(" · ")}`);
    if (!(T1 && T2 && T3 && T4 && T5 && T6)) {
        console.error("\n❌ ROT — ein Takt rechnet Teures für die ganze Welt.");
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Takt kostet, was ihn betrifft, nicht die Weltgröße.");
})().catch((e) => {
    console.error("❌ FEHLER:", e && e.stack ? e.stack : e);
    process.exit(1);
});
