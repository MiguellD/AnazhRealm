// BAUSTEIN-MESSUNG (kein Schnitt): der Stoff OHNE die Kaskaden-Schatten der Sonne — das Richtlicht wirft nicht (die CSM und
// mit ihr die Sonnen-Sicht entstehen in keinem Programm). Gesetzt gleich nach dem Bau der Lichter (`_luftEnsure` in init).
if (P) {
    const L0 = P._luftEnsure;
    P._luftEnsure = function () {
        const aus = L0.apply(this, arguments);
        if (this.state.directionalLight) this.state.directionalLight.castShadow = false;
        return aus;
    };
}
