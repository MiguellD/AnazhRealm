// BAUSTEIN-MESSUNG (kein Schnitt): der Stoff OHNE die Luft (`scene.fogNode`: Luftperspektive, Himmels-Sicht, Luftschatten).
if (P) {
    const L0 = P._luftEnsure;
    P._luftEnsure = function () {
        const aus = L0.apply(this, arguments);
        if (this.state.scene && this.state.scene.fogNode) this.state.scene.fogNode = null;
        return aus;
    };
}
