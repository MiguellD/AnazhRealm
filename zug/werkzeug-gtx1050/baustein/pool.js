// BAUSTEIN-MESSUNG (kein Schnitt): der Stoff OHNE den Licht-Pool (vier Plätze mit Lambert + GGX, samt Würfel-Schatten) — 0.
if (P) {
    P._lichtPoolTerm = function (Te) {
        return Te.vec3(0);
    };
}
