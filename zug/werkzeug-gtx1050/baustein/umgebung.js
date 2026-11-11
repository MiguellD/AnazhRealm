// BAUSTEIN-MESSUNG (kein Schnitt): der Stoff OHNE die Umgebung der Szene (`scene.environment` · `environmentNode`: der Himmel
// als Umgebungs-Licht und Spiegel) — die Szene trägt keine.
if (P) {
    const L0 = P._luftEnsure;
    P._luftEnsure = function () {
        const aus = L0.apply(this, arguments);
        const s = this.state.scene;
        if (s && !s.__ohneUmgebung) {
            s.__ohneUmgebung = true;
            for (const k of ["environment", "environmentNode"]) Object.defineProperty(s, k, { get: () => null, set() {}, configurable: true });
        }
        return aus;
    };
}
