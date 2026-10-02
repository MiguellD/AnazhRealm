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
// --selftest: ein Takt, der wieder die Tags ALLER Bauten rechnet (die alte Reihenfolge), macht T1 rot; der alte
// Wer-zuerst-fragt-Takt macht T3 rot.
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
            // T3 — der Feld-Bake-Takt geht NAH zuerst über alle Verbraucher: Fenster 1 verbrauchen ferne Fits das
            // Budget, ein naher wird abgewiesen; im Fenster 2 bekommt der nahe, der ferne wartet.
            const erlaubt = selbst
                ? function () {
                      // die alte Klasse: wer im Fenster zuerst fragt, bekommt
                      const j = performance.now();
                      if (this._weltBakeFenster === undefined || j - this._weltBakeFenster > 1000) {
                          this._weltBakeFenster = j;
                          this._weltBakeN = 0;
                      }
                      if (this._weltBakeN >= (this.state._frameOverBudget ? 4 : 16)) return false;
                      this._weltBakeN++;
                      return true;
                  }
                : r._weltBakeErlaubt;
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
            st._frameOverBudget = ueber;
            r._weltBakeFenster = undefined;
            r._weltBakeHunger = Infinity;
            const t3 = { fernJa, nah1, fern2, nah2 };
            return { t1, t2, t3, n: bauten.length, reichweite: r.constructor.FOCUSING_HEAT_RANGE_M };
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
    if (SELBST) {
        const ok = !T1 && !T3;
        console.log(
            `${ok ? "✅" : "❌"} SELBST-TEST: der Takt mit den Tags ALLER Bauten ruft ${aus.t1}× in 10 Takten → T1 ${T1 ? "grün (vakuös!)" : "rot"}; ` +
                `der Wer-zuerst-fragt-Takt gibt Fenster 2 dem Fernen (${t3.fern2}) → T3 ${T3 ? "grün (vakuös!)" : "rot"}`
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
    if (!(T1 && T2 && T3)) {
        console.error("\n❌ ROT — ein Takt rechnet Teures für die ganze Welt.");
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Takt kostet, was ihn betrifft, nicht die Weltgröße.");
})().catch((e) => {
    console.error("❌ FEHLER:", e && e.stack ? e.stack : e);
    process.exit(1);
});
