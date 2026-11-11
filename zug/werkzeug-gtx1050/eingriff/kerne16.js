// Eingriff zum Messen: die Maschine meldet 16 Kerne — die Foundry bekommt vier Fäden statt zwei (`_foundryFaedenZahl`: einer je
// vier Kerne), wie gate:fluss W6 es tut. Vor der Klasse (P === null) gesetzt.
if (!P) Object.defineProperty(Navigator.prototype, "hardwareConcurrency", { configurable: true, get: () => 16 });
