// diag-reload-treue.cjs — RELOAD-TREUE: DIE KREATUR KEHRT WIE GEGOSSEN WIEDER.
// Der GUSS friert die wirksame Übergabe je Wesen ein
// (group.userData.gussDials — nur wenn eine aktiv war, sonst feld-los + byte-alt), der Snapshot
// trägt sie, und der Restore pinnt sie durch DENSELBEN Prüfer (Kreatur-PARAMS-Klemme) als
// dialsOv in den Neu-Guss. Diese Linse hält die Naht:
//
//   (R) GUSS-TREUE: Wolf unter Übergabe size 3.5 gegossen → Snapshot → Übergabe auf 1.5 GEÄNDERT
//       → Restore ⇒ der Wolf trägt WEITER 3.5 (Guss-Treue), ein FRISCHER Wolf trägt 1.5.
//   (S) SELBST-TEST (nicht vakuös): OHNE den Guss-Pin (gussDials aus dem Snap gestrippt) liest
//       der Restore die aktuelle Übergabe (1.5) — d. h. der alte Fehler wird sichtbar.
//   (D) DEFAULT-TREUE: eine Kreatur OHNE Übergabe reist feld-los (kein gussDials) + byte-alt.
//   (W) WAND: ein hand-editierter Riesen-Dial im Snapshot wird am Restore-Validator geclampt.
//
//   node scripts/diag-reload-treue.cjs
"use strict";
const { statikServer, hauptLauf, nullSeite, pruefer, wandEnde } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.RELOAD_TREUE_PORT || 4459);
const server = statikServer();

const { errs, check } = pruefer();

hauptLauf(async () => {
    console.log("=== RELOAD-TREUE — der Guss-Pin am Verhalten ===");
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 300000 });
    await server.zeige(page, 30000);

    const out = await page.evaluate(async () => {
        const res = { r: {}, s: {}, d: {}, w: {} };
        const r = await window.__weltDa();
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready && f.recipes && f.recipes.wolf && !f._vorrat);
        if (!(f && f.ready && f.recipes && f.recipes.wolf)) return { fatal: "wolf-Rezept kam nie" };

        // Leere Bühne + genug Kapazität.
        for (const c of r.state.creatures.slice()) r.removeCreature(c);
        r.state.maxCreatures = 12;
        const fpGroup = window.__abdruck; // der EINE Abdruck (welt-boot)
        const setUe = (size) => {
            r._studioUebergabeEmpfang({ type: "uebergabe", kind: "kreatur", preset: "wolf", seed: 0, ov: { size } });
        };
        const spawnWolf = (opts) =>
            // BÜHNE: der Wolf fällt präzise aus 40 m (die Probe misst Gestalt und Reload, nie den Boden)
            r.spawnCreatureAt(0, 40, 0, "happy", "wolf", Object.assign({ precise: true, bodySize: 1 }, opts || {}));

        // ── Übergabe size 3.5 → Wolf A gegossen ──
        setUe(3.5);
        const wolfA = spawnWolf();
        res.r.aGussDials = wolfA && wolfA.userData.gussDials ? wolfA.userData.gussDials.size : null;
        const fpA = wolfA ? fpGroup(wolfA) : null;
        const snapA = r._serializeCreature(wolfA);
        res.r.snapTraegt = !!(snapA && snapA.gussDials && snapA.gussDials.size === 3.5);
        r.removeCreature(wolfA);

        // ── Übergabe auf 1.5 ÄNDERN ──
        setUe(1.5);
        // ein FRISCHER Wolf trägt jetzt 1.5
        const wolfNeu = spawnWolf();
        res.r.neuGussDials = wolfNeu && wolfNeu.userData.gussDials ? wolfNeu.userData.gussDials.size : null;
        const fpNeu = wolfNeu ? fpGroup(wolfNeu) : null;
        r.removeCreature(wolfNeu);

        // ── Restore aus snapA ⇒ MUSS 3.5 tragen (Guss-Treue), NICHT 1.5 ──
        const wolfR = r._restoreCreatureFromSnapshot(snapA, "happy");
        res.r.restoreGussDials = wolfR && wolfR.userData.gussDials ? wolfR.userData.gussDials.size : null;
        const fpR = wolfR ? fpGroup(wolfR) : null;
        res.r.treu = res.r.restoreGussDials === 3.5;
        res.r.geomTreu = fpR && fpA && fpR === fpA && fpA !== fpNeu; // die Geometrie folgt der GUSS-Größe
        res.r.fpA = fpA;
        res.r.fpNeu = fpNeu;
        res.r.fpR = fpR;
        r.removeCreature(wolfR);

        // ── (S) SELBST-TEST: OHNE den Pin liest der Restore die aktuelle Übergabe (1.5) ──
        const snapOhne = Object.assign({}, snapA);
        delete snapOhne.gussDials;
        const wolfS = r._restoreCreatureFromSnapshot(snapOhne, "happy");
        res.s.ohnePin = wolfS && wolfS.userData.gussDials ? wolfS.userData.gussDials.size : null;
        // ohne Pin: gussDials wird aus der AKTUELLEN Übergabe (1.5) eingefroren ⇒ der alte Fehler
        res.s.altFehlerSichtbar = res.s.ohnePin === 1.5;
        if (wolfS) r.removeCreature(wolfS);

        // ── (D) DEFAULT-TREUE: keine Übergabe ⇒ feld-los + byte-alt ──
        delete r._ensureWorkshopState().studioOv.wolf;
        const wolfD = spawnWolf();
        res.d.feldLos = !(wolfD && wolfD.userData.gussDials);
        const snapD = r._serializeCreature(wolfD);
        res.d.snapFeldLos = !!(snapD && snapD.gussDials === undefined);
        r.removeCreature(wolfD);

        // ── (W) WAND: ein Riesen-Dial im Snapshot wird am Restore geclampt ──
        const rows = window.__tetrapodaCore && window.__tetrapodaCore.PARAMS_BY_KIND.kreatur;
        const sizeRow = rows && rows.find((x) => x.id === "size");
        const snapBoese = Object.assign({}, snapA, { gussDials: { size: 9999 } });
        // der EINE Prüfer: der Restore klemmt durch _studioWerkPruefen("kreatur", …) wie der Übergabe-Kanal, keinen Zwilling
        // (Spion am Ruf)
        const echtV = r._studioWerkPruefen;
        let validiert = 0;
        r._studioWerkPruefen = function (art, ...x) {
            if (art === "kreatur") validiert++;
            return echtV.call(this, art, ...x);
        };
        const wolfW = r._restoreCreatureFromSnapshot(snapBoese, "happy");
        delete r._studioWerkPruefen;
        res.w.einValidator = validiert > 0;
        res.w.geclampt = !!(
            wolfW &&
            wolfW.userData.gussDials &&
            sizeRow &&
            wolfW.userData.gussDials.size <= sizeRow.max &&
            wolfW.userData.gussDials.size >= sizeRow.min
        );
        res.w.maxSoll = sizeRow ? sizeRow.max : null;
        res.w.istWert = wolfW && wolfW.userData.gussDials ? wolfW.userData.gussDials.size : null;
        if (wolfW) r.removeCreature(wolfW);

        return res;
    });

    await browser.close();
    server.close();

    console.log("\n===== RELOAD-TREUE — die Kreatur kehrt wie gegossen wieder =====\n");
    if (!out || out.fatal) {
        console.log("FEHLER:", out ? out.fatal : "?");
        process.exit(1);
    }
    check(`(R) Wolf A unter Übergabe 3.5 gegossen (gussDials=${out.r.aGussDials})`, out.r.aGussDials === 3.5);
    check("(R) der Snapshot trägt die Guss-Dials (3.5)", out.r.snapTraegt === true);
    check(
        `(R) ein FRISCHER Wolf nach der Änderung trägt 1.5 (gussDials=${out.r.neuGussDials})`,
        out.r.neuGussDials === 1.5
    );
    check(
        `(R) GUSS-TREUE: der restaurierte Wolf trägt WEITER 3.5, nicht 1.5 (${out.r.restoreGussDials})`,
        out.r.treu === true
    );
    check(
        `(R) und die GEOMETRIE folgt der Guss-Größe (fpR==fpA≠fpNeu: ${out.r.fpR} == ${out.r.fpA} ≠ ${out.r.fpNeu})`,
        out.r.geomTreu === true
    );
    check(
        `(S) SELBST-TEST: OHNE den Pin läse der Restore die aktuelle Übergabe (1.5) — der alte Fehler ist sichtbar (${out.s.ohnePin})`,
        out.s.altFehlerSichtbar === true
    );
    check("(D) DEFAULT-TREUE: eine Kreatur ohne Übergabe ist feld-los (kein gussDials)", out.d.feldLos === true);
    check("(D) und ihr Snapshot trägt das Feld nicht (byte-alt)", out.d.snapFeldLos === true);
    check(
        `(W) ein Riesen-Dial (9999) im Snapshot wird am Restore geclampt (≤ ${out.w.maxSoll}, ist ${out.w.istWert})`,
        out.w.geclampt === true
    );
    check("(W) der Restore klemmt durch DENSELBEN Kreatur-Validator", out.w.einValidator === true);

    wandEnde(errs, "die Reload-Treue steht: der Guss friert die wirksame Übergabe je Wesen ein, der Snapshot trägt sie, der Restore pinnt sie durch DENSELBEN Validator — die Kreatur kehrt wie gegossen wieder (auch wenn die Übergabe sich änderte), Default-Kreaturen bleiben byte-alt, und ein Riesen-Dial wird geclampt.");
});
