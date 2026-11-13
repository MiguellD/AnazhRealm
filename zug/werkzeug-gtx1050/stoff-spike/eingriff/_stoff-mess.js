// Messung ohne Eingriff — DER STOFF-SPIKE: (1) der Stand der Erst-Zeichnung im Task des ersten Weltbilds (Knoten-Bauten, ihre ms,
// verschobene, asynchrone Pipelines, bereit) und 20 s danach; (2) die Bild-Abstände nach dem Bild je 2-s-Fenster [n, Median ms, p95 ms];
// (3) Bilder als JPEG hinter `_kontaktPassZeichne`: `erstbild` im Task des ersten Weltbilds, `abgeloest` beim ersten Bild, in dem
// kein Bürger mehr in Stufe 0 zeichnet (nur wenn `_stufeNullStand` lebt), `spaet` 20 s nach dem Bild; (4) der Stand der Stufe 0 je
// Bild (Bürger in Stufe 0, gebaute Stufe-0-Programme) als Zeitreihe [ms nach dem Bild, Bürger, Programme].
// → extra.stoff = { bild: {...}, spaet: {...}, takt: [[fenster s, n, median, p95]], bilder: [[name, ms]], stufe0: [[ms, n, prog]], abgeloestMs, fehler }
if (P && !P.__stoffMess) {
    P.__stoffMess = true;
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const S = (X.stoff = { bild: null, spaet: null, takt: [], bilder: [], stufe0: [], abgeloestMs: null, fehler: "" });
    const getan = {};
    const stand = (w) => {
        const E = w._erstZeichnungStand();
        return { ms: Math.round(performance.now()), bauN: E.bauN, bauMs: Math.round(E.bauMs), verschoben: E.verschoben, pipeAsync: E.pipeAsync, bereitN: E.bereitN, wartetN: E.wartetN, imFlug: E.imFlug.size, offen: E.offen.size };
    };
    let [letzt, fenster, dts] = [0, 0, []];
    const schuss = (w, name) => {
        getan[name] = true;
        const c = w.state.renderer.domElement;
        S.bilder.push([name, Math.round(performance.now())]);
        fetch("/__bild", { method: "POST", body: JSON.stringify({ name, daten: c.toDataURL("image/jpeg", 0.88) }) }).catch(() => {});
    };
    const Z0 = P._kontaktPassZeichne;
    P._kontaktPassZeichne = function (...a) {
        const aus = Z0.apply(this, a);
        try {
            const da = this.state._weltbildDa;
            if (!da) return aus;
            const jetzt = performance.now();
            const nach = jetzt - da;
            if (!getan.erstbild) [S.bild] = [stand(this), schuss(this, "erstbild")];
            if (letzt) {
                const f = Math.floor(nach / 2000);
                if (f !== fenster && dts.length) {
                    dts.sort((x, y) => x - y);
                    S.takt.push([fenster * 2, dts.length, Math.round(dts[dts.length >> 1]), Math.round(dts[Math.min(dts.length - 1, Math.floor(dts.length * 0.95))])]);
                    [fenster, dts] = [f, []];
                }
                dts.push(jetzt - letzt);
            }
            letzt = jetzt;
            const N0 = typeof this._stufeNullStand === "function" ? this._stufeNullStand() : null;
            if (N0) {
                if (S.stufe0.length < 400) S.stufe0.push([Math.round(nach), N0.bild, N0.programme]);
                if (!getan.abgeloest && getan.erstbild && S.stufe0.some((e) => e[1] > 0) && N0.bild === 0) [S.abgeloestMs] = [Math.round(nach), schuss(this, "abgeloest")];
            }
            if (!getan.spaet && nach > 20000) [S.spaet, S.null0] = [stand(this), N0, schuss(this, "spaet")];
            if (S.bild && !S.bild.null0 && N0) S.bild.null0 = N0;
        } catch (err) {
            S.fehler = String(err.message);
        }
        return aus;
    };
}
