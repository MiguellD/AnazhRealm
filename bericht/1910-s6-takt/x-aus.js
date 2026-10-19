// 1910 S6-Takt ARM X: B-Code, aber der Verband von Anfang an AUS — direkt nach „WERKBANK bereit" (vor umstellen und lauf):
// keine neue Bindung (`_kreaturVerbinden` an der Instanz als leere Funktion: der Wurf bindet nicht mehr) und jedes schon
// gebundene Glied ohne Verband (userData.verband = undefined). Kein Proxy. Die Herde lebt die ganze Sitzung wie an A.
r._kreaturVerbinden = function () {};
let n = 0;
for (const c of r.state.creatures) {
    const u = c && c.userData;
    if (u && u.verband != null) {
        u.verband = undefined;
        n++;
    }
}
return { aus: n, tiere: r.state.creatures.length, binden: "aus" };
