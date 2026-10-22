// je Lage (window.__nkLage): D trocken, N0 nass ohne Dach-Pool, N1 nass mit Dach-Pool — der Regen bleibt in jeder Lage.
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
U.dachAn.value = L === "N0" ? 0 : 1;
window.__buehne();
return { lage: L, wetter: r.state.weather, naesse: +U.naesse.value.toFixed(3), dachAn: U.dachAn.value };
