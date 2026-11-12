// Aufruf: keiner — frei-sonde.cjs lädt diese Datei nur mit FREI_VARIANTE=B|C (Text-Tausch für Lade-Varianten).
// variante.cjs — die Varianten des Foundry-Boots als Text-Tausch an der ausgelieferten stamm/studio-bruecke.js (kein Eingriff im Baum):
// B = das Manifest synchron (XHR im Faden, keine Rückfrage an den Code-Cache) · C = die Engine synchron geholt und als Blob-Modul
// importiert (blob: fragt den Code-Cache nicht). `tausche(text, "BC")` → der getauschte Text; fehlt eine Stelle, wirft es beim Namen.
const B_ALT = `        fetch(url("cores.manifest.json"))
            .then((r) => {
                if (!r.ok) throw new Error("STOFF: die Foundry bootet nicht — das Kern-Manifest antwortet " + r.status);
                return r.json();
            })`;
const B_NEU = `        new Promise((ok) => {
            const x = new XMLHttpRequest();
            x.open("GET", url("cores.manifest.json"), false);
            x.send();
            if (x.status !== 200) throw new Error("STOFF: die Foundry bootet nicht — das Kern-Manifest antwortet " + x.status);
            ok(JSON.parse(x.responseText));
        })`;
const C_ALT = `return import(motoren[0]).then((T) => [manifest, T, motoren[0]]);`;
const C_NEU = String.raw`const holen = (u) => {
                    const x = new XMLHttpRequest();
                    x.open("GET", u, false);
                    x.send();
                    if (x.status !== 200) throw new Error("STOFF: die Foundry bootet nicht — die Engine antwortet " + x.status + " (" + u + ")");
                    return x.responseText;
                };
                const blob = (t) => URL.createObjectURL(new Blob([t], { type: "text/javascript" }));
                let q = holen(motoren[0]);
                for (const rel of new Set([...q.matchAll(/from\s*"(\.\/[^"]+)"/g)].map((m) => m[1])))
                    q = q.split('"' + rel + '"').join('"' + blob(holen(new URL(rel, motoren[0]).href)) + '"');
                return import(blob(q)).then((T) => [manifest, T, motoren[0]]);`;
function tausche(text, v) {
    let t = text.replace(/\r\n/g, "\n");
    for (const [k, alt, neu] of [
        ["B", B_ALT, B_NEU],
        ["C", C_ALT, C_NEU],
    ]) {
        if (!v.includes(k)) continue;
        if (t.split(alt).length !== 2) throw new Error("Variante " + k + ": die Stelle steht " + (t.split(alt).length - 1) + "× im Text");
        t = t.replace(alt, () => neu);
    }
    return t;
}
module.exports = { tausche };
