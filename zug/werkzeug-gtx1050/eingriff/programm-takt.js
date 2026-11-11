// Eingriff zum Messen: wartet das erste Weltbild NUR noch auf Programme (jede offene Lücke ist „bauten“ an einem gezeichneten Ding:
// seine Arena hat kein Programm, oder das Bild nach seinen Arenen fehlt), gehört der Lade-Takt dem Knoten-Bau —
//   (a) das Lade-Bild ist in jedem Takt fällig, solange die Schuld der Erst-Zeichnung offen ist,
//   (b) die Leser des Takts gehen nur ihr Pflicht-Stück (ein Zehntel der Frist), die Zeichnung bekommt den Rest.
// Zähler in __sondeExtra.programmTakt: wie oft die Phase galt.
if (P) {
    const X = (window.__sondeExtra = window.__sondeExtra || {});
    const Z = (X.programmTakt = { takte: 0, ab: null, bis: null });
    let takt = null;
    let nur = false;
    const nurProgramm = (welt) => {
        if (welt._taktZeit === takt) return nur;
        takt = welt._taktZeit;
        nur = false;
        if (!welt._ladeTakt()) return false;
        const L = welt._weltbildLuecken();
        nur = L.length > 0 && L.every((l) => l.term === "bauten" && l.zeuge && welt._archIsRendered(l.zeuge));
        if (nur) {
            Z.takte++;
            const t = Math.round(performance.now());
            if (Z.ab == null) Z.ab = t;
            Z.bis = t;
        }
        return nur;
    };
    const F0 = P._ladeBildFaellig;
    P._ladeBildFaellig = function (L) {
        const E = this._erstZeichnung;
        if (E && E.ladeSchuld === true && nurProgramm(this)) L.ladeVorher = false;
        return F0.call(this, L);
    };
    const B0 = P._deferrableBudgetMs;
    P._deferrableBudgetMs = function () {
        const r = B0.call(this);
        return this._ladeBildTakt && nurProgramm(this) ? AnazhRealm.LADE_TAKT_MS / 10 : r;
    };
    const L0 = P._ladeFrist;
    P._ladeFrist = function (zeichnung = false) {
        const r = L0.call(this, zeichnung);
        if (!zeichnung && this._ladeBildTakt && r > -Infinity && nurProgramm(this))
            return this._ladeFristBis - 0.9 * AnazhRealm.LADE_TAKT_MS;
        return r;
    };
}
