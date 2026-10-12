# Bericht 1110-11b — Die Blende bricht laut beim Namen

1. **Geschnitten:** `_lodCrossfadeMaskNode` gibt nie mehr still `null` zurück. Jedes fehlende Glied bricht den Bau des Stoffs über
   `_blendeBruch` (ERROR, das Glied beim Namen), und kein Aufrufer zeichnet ohne Maske weiter.
2. **Gemessen:**
   - Die Linse gate:foundry-crossfade (9) DIE LAUTE BLENDE war auf welle-m-birke 80912b9d ROT, statisch und in der echten Seite:
     ohne uLodD0 entstand der Baum-Stoff still ohne Maske.
   - Auf welle-m-blende-laut **e60d0bbd** ist sie GRÜN, der Selbsttest nennt 6 Brüche. Die echte Wiese baut ohne einen Bruch,
     12 Wände sind GRÜN.
3. **Ehrlich offen:**
   - Zwei andere stille Fänge daneben sind nur benannt: die Silhouetten-Zeile der Blatt-Karte (`__unlitFloorError`) und die
     Karten-Verdrahtung (`__impostorAtlasError`, die Fernstufe serviert dann Geometrie mit einem WARN).
   - Ebenso die Durchsicht der Kamera (`if (_durch)`).

Auftrag: Nachricht des Koordinators nach der Annahme von 1110-11 (Branch welle-m-blende-laut auf welle-m-birke 80912b9d).

## Wer im Fehlerfall still weiterzeichnete (vorher)

| Stelle | still | Folge im Bild |
|---|---|---|
| `_lodCrossfadeMaskNode`, Kopf | `return null`, wenn ein Uniform (uLodRef … uLodPerf) oder ein TSL-Knoten fehlt | der Aufrufer bekommt keine Maske |
| `_lodCrossfadeMaskNode`, Karte | `return null` ohne `distNode` | dito |
| `_lodCrossfadeMaskNode`, 3D-Stufen | `return null` ohne `TSL.attribute` / `uLodAuge` | dito |
| `_lodCrossfadeMaskNode`, `catch` | der Fehler wandert in `window.__foundryCrossfadeError` (kein Leser), `return null` | dito |
| Baum-Stoff (`_foundryTreeMaterial`) | `if (_keepX)`; ohne Kanal (`if (kanal)`) fällt die Maske still weg | L0 und Band-L1 deckungsgleich voll, die Instanz-Wahl ohne Fenster |
| Karte (`_sharedFoliageMaterial`, Atlas) | `if (_keepFin)`; der `catch` der Verdrahtung schluckt jeden Fehler | die Karte blendet nie aus oder fällt still in die Geometrie |
| Blatt-Karte (Grammatik) | ohne Ausstattung übersprungen, `catch` → `__lodCrossfadeError` | keine Stufen-Blende |

## Der Schnitt (welle-m-blende-laut e60d0bbd)

- `_blendeBruch(was)` loggt ERROR mit dem Namen des Glieds und liefert einen Fehler mit der Marke `blende`.
- Die Maske nennt jedes fehlende Uniform und jeden TSL-Knoten. Ihr `catch` bricht und reicht einen schon benannten Bruch weiter.
- Baum-Stoff und Karte setzen die Maske ohne Wenn. Ein Stoff ohne Kanal (weder Deckung noch Farbe mit Alpha) bricht beim Namen,
  die Marke `foundryCrossfade` steht immer.
- Der `catch` der Karten-Verdrahtung reicht den Bruch der Blende weiter, statt in die Fernstufen-Geometrie zu fallen.
- Die Blatt-Karte bricht wie die Maske, die Fenster-Variablen `__foundryCrossfadeError` und `__lodCrossfadeError` fallen.

## Die Linse (9) DIE LAUTE BLENDE (gate:foundry-crossfade)

- **Statisch** (kommentar-gestrippt): kein `null` in der Maske, kein schluckender `catch`, keine Fenster-Variable, `_blendeBruch`
  meldet ERROR, keine Maske unter Wenn, kein Stoff ohne Kanal, die Karte reicht den Bruch weiter, die Blatt-Karte bricht.
- **In der Seite** (Teil b, echte Welt): Der Uniform-Satz verliert `uLodD0`, und ein Baum-Stoff wird frisch gebaut.
  - Vorher (80912b9d): „der Stoff entstand still (Maske fehlt)", ROT (`linse-vorher-80912b9d.log`).
  - Nachher: „BLENDE: es fehlt uLodD0 — kein Stoff zeichnet ohne seine Maske", GRÜN (`linse-nachher.log`).
- **Selbsttest** (`linse-selbsttest.log`): Maske gibt null · catch schluckt · Baum-Stoff unter Wenn · Karte unter Wenn ·
  Karte schluckt den Bruch · Blatt-Karte springt still. Jede Stelle wird beim Namen genannt.

## In der echten Welt

- Eine Sitzung an der Wiese (welle-m-blende-laut, eingeschwungen): 0 BLENDE-Brüche und 0 ERROR im Log des Stamms.
- Alle Baum-, Laub-, Karten-, Gras- und Schatten-Stoffe tragen ihre Maske. Maskenfrei bleiben bewusst die Klassen-Look-Familie
  (Fell, Haut, Haar) und der wiegende Stoff der Nah-Streu (`streuSatz`, „blendet nie").

## Wände (je EXIT=0)

gate:foundry-crossfade (mit (8) und (9)) · gate:foundry-impostor · gate:kamera-laub · gate:fernwald · gate:foliage-res ·
gate:boot-foliage-ring · gate:s4-impostor-workshop · gate:kamera-treue · gate:sicht-arbeit · gate:scatter-lod · gate:vendor-anker
· `npm run check` · playtest:fast · lint · format:check · gate:worker-dichte. CI 38224260747 lief zur Abgabe.

Nebenbei: Die CI von welle-m-birke 80912b9d (38219933869) ist 13/13 GRÜN.

## Offen (mit Zahl)

1. Drei stille Fänge derselben Art, nicht Blende, nur benannt:
   - die Silhouetten-Zeile der Blatt-Karte (`__unlitFloorError`, `_sharedFoliageMaterial`);
   - die Karten-Verdrahtung ohne Blende (`__impostorAtlasError`, WARN, dann Geometrie);
   - die Durchsicht der Kamera (`_kameraDurchsichtNode` → `if (_durch)`).
2. Aus 1110-11 und 1110-10 bleiben:
   - die CPU-Mitgliedschaft im Studio-Rand M (zwei Slots, gezeichnet eine Stufe);
   - CPU-Takt p95 frei +0,55 ms;
   - Bühne s5-bucht +0,15 ms;
   - A zweigipflig an der Bühne (b7A);
   - die Instrument-Variante der Genesis-Folge.

## Geschnitten · Gemessen · Pflicht-OFFEN Rest

- **Geschnitten:** die stille Blende (Maske, Baum-Stoff, Karte, Blatt-Karte) — sie bricht laut beim Namen.
- **Gemessen:** Linse (9) vorher ROT (statisch + Seite), nachher GRÜN; Wiese 0 Brüche; 12 Wände GRÜN.
- **Pflicht-OFFEN Rest:** A · B · C · E stehen.

## Status: ZWISCHENSTAND · Übergabe

- welle-m-blende-laut **e60d0bbd** (per ls-remote, `[ci voll]`), auf welle-m-birke 80912b9d.
- Danach: welle-m-e-torwurf (WIP 1c2ceb4c).
