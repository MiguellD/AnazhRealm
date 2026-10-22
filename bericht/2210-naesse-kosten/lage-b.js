// je Lage (window.__nkLage): D trocken, N nass (Kopf naesse-kosten: der Pool mit Hülle) — der Regen bleibt in jeder Lage.
// v3: `_naesseTakt` rechnet aus state.naesse weiter — D setzt state.naesse = 0 und die Bühne rückt 0 s vor (bleibt trocken), N* 600 s Regen.
const L = window.__nkLage || "N1";
const U = r._ensureAtmoUniforms();
if (!window.__nkHuelle) {
    const b = window.__buehne;
    window.__buehne = (o) => {
        if (window.__nkLage === "D") r.state.naesse = 0;
        return b(Object.assign({ wetter: "rainy", naesse: window.__nkLage === "D" ? 0 : 600 }, o || {}));
    };
    window.__nkHuelle = true;
}
window.__buehne();
