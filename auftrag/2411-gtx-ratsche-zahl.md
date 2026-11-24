# Auftrag GTX 1050 24.11. 12:50 — die Zeichen-Ratsche des Boden-Programms urteilt nicht mehr, sie nennt die Zahl

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

## Befund

- `gate:pruefbuehne-licht` fällt an JEDEM Kopf, der main seit z713 (bf5a1542, 11:35) trägt: „S0 Boden-Programm: 108011 Zeichen WGSL
  (Budget ≤ 104162)“. Erster Fall: ort-ausstattung 2 (4d012d86), Läufer radeon-890m. Vor z713 standen Radeon und GTX 1060 bei 103 347.
- Der Zuwachs von 4 664 Zeichen ist ein gelandeter Bild-Gewinn (stadtklima#1 `_naesseOrtKnoten`: die Pfütze trocknet im Schatten der
  Häuser später; jahreslauf#2 `uLaubJahr`), kein Defekt.
- Die Zeichenzahl sagt die Übersetzungszeit hier nicht voraus: dieselbe Probe misst kalt im Median 701 ms bei 108 011 Zeichen
  (ort-ausstattung 2) und 1 081 ms bei 103 347 (ort-ausstattung 1), beide auf der Radeon.
- Wort des Schöpfers 24.11.: „ist das wirklich ein problem? was ist das wahre ziel dieser regel“ — und 19.11.: Kaltstart ist kein Tor.

## Entscheid des Koordinators

Die Zeichenzahl ist kein Tor. `scripts/diag-pruefbuehne.cjs` (`S0_ZEICHEN`, Zeile 897–900): `zeichenMax` fällt aus dem `budget` von S0.
Die Zeile „S0 BODEN-PROGRAMM“ nennt weiter die Zahl und dazu den Zuwachs gegen den gebuchten Stand (jetzt 108 011, GTX und Radeon
gleich) — laut, aber grün. Tor bleibt, was bricht: `bindungInFunktionMax` 0, die Abtastungen, `gate:webgl-probe` (16 Sampler). Kein
Zwilling, kein Flag; der Kommentar über `S0_ZEICHEN` nennt den Entscheid mit Datum und die zwei Messzahlen. Trägt der Selbsttest eine
Mutante für die Größe, fällt sie mit; die übrigen Mutanten bleiben ROT wie zuvor. `GRENZEN.zeichenMax` in
`scripts/lib/shader-kosten.cjs` bleibt nur, wenn ein zweiter Leser sie ruft (Grep, sonst fällt sie mit).

## Abgabe — EIN Commit, byte-gleich pflückbar

1. `probe-deckel-einlass`: main bf9be26c einmischen (Konflikt `spec/ci/ci-zeiten.json`: main nehmen, neu erzeugen).
2. Den Ratschen-Schnitt als EIGENEN Commit obenauf (nur die Dateien des Schnitts) — sein SHA ist die Pflück-Quelle für jeden Zweig,
   den der Deckel hält (ort-ausstattung, der Haus-Stapel, fahrzeug-gattung, sport-regeln): identische Hunks mischen ohne Konflikt.
3. Lokal: `npm run gate:pruefbuehne-licht` auf deiner GPU grün, mit der Zahl; `check:statik`, `format:check`, `lint`.
4. Vorprüfung mit `[gpu-probe: gate:pruefbuehne-licht]` und `[ci voll]`. Die zwei Rots des alten Kopfs f4158c03 kamen nicht aus dem
   Zweig (Basis V18.546.397: Studio-Dither-Blende „SLOT-BILANZ“, Stand-Takt „DRUCK-SCHLAF 6 von 70 Scherben wach“) — kehren sie am
   neuen Kopf wieder, erst der zweite Versuch, dann Täter nennen.
5. Melde mir den SHA des Ratschen-Commits SOFORT nach dem Push (vor der Batterie) — ich gebe ihn an OMEN und die Arbeiter weiter.

## Dazu, selbe Familie (Einlass der GPU-Probe)

Der Probe-Post `probe-post/w28-tat-aufwaerts/5c650d13.md` nennt „Ruf: —“: eine GPU-Probe ohne eine einzige Probe war GRÜN (prüfe es am Lauf). Ein leerer Ruf an einem Kopf,
der `stamm/` oder einen Kern berührt, fährt die Grundliste (`gate:pruefbuehne-licht gate:weltbild-frost:echt gate:studio-begehen
gate:webgl-probe`) — nie grün durch Leere. Mit Selbsttest (Mutante: leerer Ruf am Spiel-Kopf bleibt grün → ROT).
