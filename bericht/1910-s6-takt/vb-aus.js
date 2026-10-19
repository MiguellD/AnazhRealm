// 1910 S6-Takt UMSCHALTER: der Verband AUS (Daten-Ebene, kein Proxy, keine Hülle): jedes Glied verliert sein `userData.verband`
// (auf undefined, die Gestalt des userData bleibt), gemerkt in window.__vbStash — `updateCreatures` sammelt dann keine Verbände,
// `_kreaturVerbandZug` und `_kreaturVerbandAlarm` kehren sofort um (glieder null). vb-an.js stellt jedes Glied zurück.
const S = window.__vbStash || (window.__vbStash = new Map());
let n = 0;
for (const c of r.state.creatures) {
    const u = c && c.userData;
    if (u && u.verband != null) {
        S.set(c, u.verband);
        u.verband = undefined;
        n++;
    }
}
return { aus: n, gemerkt: S.size, verbaendeMap: r._verbaende ? r._verbaende.size : null };
