// 2210 ABAB bewohner-gang, Zelle d-ego: die Uhr als Spieler-Wort (setTimeOfDay(8/24, "human")) hält jede Bühne der Messung —
// die Bewohner gehen am Morgen; der Dorf-Zug läuft (Messort dorf)
if (!window.__uhrHuelle) {
    const b = window.__buehne;
    window.__buehne = (o) => {
        const e = b(o);
        if (r.state.world) r.state.world.timeOfDay = 8 / 24;
        r.setTimeOfDay(8 / 24, "human");
        return e;
    };
    window.__uhrHuelle = true;
}
window.__buehne();
let leiber = 0;
r.state.scene.traverse((o) => o.name === "bewohner" && o.visible && leiber++);
return { uhr: +r.state.timeOfDay.toFixed(4), leiber };
