// DAS MASS DER ZEIT-STATIONEN (das Gesetz der Fremd-Last, punkte.cjs fremdUrteil): je Zeit-Station ein Feld NEBEN ihrem Urteil —
// `mass(j, lauf, urteil)` liest aus derselben Ausgabe die Zahlen, an denen das Urteil fällt, gegen ihr Soll ([{ wort, wert, soll,
// richtung "≤"|"≥", fest? }]), oder `ohneMass` nennt den Grund, warum ihr Urteil keine Zahl mit geeichtem k spricht. Beide stehen NIE im
// Abdruck (punkte.cjs abdruck): sie ändern nicht, was die Station misst — Befehl, Urteil, Pfad, Linse —, nur wie die Maschine ihr ROT
// unter Last liest. Je Datei EINE Tafel am Ende (gN.js), massAn hängt sie an ihre Stationen; ein Schlüssel ohne genau eine Station wirft
// beim Laden, beim Namen. Ob jede Zeit-Station genau eines trägt, urteilt FORMAT (punkte.cjs pruefeStationen).
"use strict";
function massAn(liste, tafel) {
    for (const [id, m] of Object.entries(tafel)) {
        const treffer = liste.filter((st) => st && st.kriterium + "#" + st.staffel === id);
        if (treffer.length !== 1) throw new Error("das Maß " + id + " trifft " + treffer.length + " Stationen (Soll 1)");
        if (typeof m === "function") treffer[0].mass = m;
        else if (typeof m === "string") treffer[0].ohneMass = m;
        else throw new Error("das Maß " + id + " ist weder Funktion noch Grund");
    }
    return liste;
}
module.exports = { massAn };
