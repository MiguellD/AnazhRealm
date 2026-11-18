# Nachtrag zur Tafel — die Mondphase ist GESETZT (GTX 1050, 19.11., an der Quelle gelesen)

**Größe:** Mond-Richtung und Mond-Phase · **Wert:** `moonDir = −sunDir` — der Mond steht jede Nacht VOLL der Sonne gegenüber ·
**Einheit:** Stellwert ohne Einheit (Phase 1,0 fest) · **Anker:** keiner (Kommentar „der Vollmond steht der Sonne gegenüber") ·
**Stelle:** `stamm/bild-himmel.js:1146-1150` auf main b7ed84194 (`_applyDayNightToScene`), Quelle `__weltLicht.mondRichtung` ·
**Leser:** das Richtlicht der Nacht (`lightDir`), der Körper des Monds (`_updateCelestialBodies`), Wasser-Glitzer,
Gras-Durchlicht, die Mond-Beleuchtungsstärke (`MOND_STAERKE` 0,65 / die Lux-Werte des Blatts a) · **Status:** GESETZT ohne Anker.

**Was folgen müsste:** die Phase aus Sonne, Mond und der Welt-Uhr (Mond-Umlauf gegen den Sonnen-Tag, synodisch 29,53 Tage — belegt),
daraus der Winkel Sonne–Mond, daraus die Beleuchtungsstärke (Vollmond 0,1–0,3 lx; die Phasen-Kurve ist nicht linear im beleuchteten
Anteil: Oppositions-Spitze, belegt z. B. bei Allen, Astrophysical Quantities — Wert hier NICHT nachgeschlagen, UNSICHER) und die
Auf-/Untergangs-Zeit (bei Neumond steht der Mond am Tag am Himmel, die Nacht trägt nur Sterne, ~0,001 lx).

**Bahn:** A (Auge · Kurve · Himmel; Dateien welt-licht.js und stamm/bild-himmel.js liegen dort). Gezählt als EINE weitere gesetzte
Größe der Licht-Kette (Tafel: 111 statt 110 Größen ohne Anker).

**Folge für den Spike:** Neumond ist auf main und am Spike-Zweig **nicht erzeugbar** — er wird ein Ort des GPU-Spikes erst, wenn die
Phase folgt. Bis dahin urteilt kein Bild über die Sternen-Nacht.
