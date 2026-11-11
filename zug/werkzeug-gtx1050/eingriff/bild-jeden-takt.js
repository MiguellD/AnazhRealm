// Eingriff zum Messen: solange die Schuld der Erst-Zeichnung offen ist (ein Knoten-Bau wartete im letzten Bild auf die Frist),
// ist das Lade-Bild in JEDEM Takt fällig — nicht nur in jedem zweiten (`_ladeBildFaellig`: `L.ladeVorher`).
if (P) {
    const F0 = P._ladeBildFaellig;
    P._ladeBildFaellig = function (L) {
        const E = this._erstZeichnung;
        if (this._ladeTakt() && E && E.ladeSchuld === true) L.ladeVorher = false;
        return F0.call(this, L);
    };
}
