// Eingriff zum Messen (kalter Boot, die Platte ist leer): die Karte fragt die Platte nicht — sie bestellt ihre Höhen-Stufe sofort.
// Trägt der Unterschied, hält die Frage der Platte (ein sicherer Miss, der hinter den Bauten des Fadens ansteht) das Bild.
if (P) {
    P._kartePlatteFragen = function (z) {
        if (z._platte === undefined) z._platte = null;
    };
}
