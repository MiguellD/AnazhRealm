# Bericht 2110 bausatz-absage: Kopf 8210f3e2 [ci voll] (Zweig bausatz-absage, integ-probe 2160be58 hineingemergt → Merge in integ = Fast-Forward)

- **Geschnitten:** Es gibt keine abgesagte Pipeline. Die Ursache war der Geometrie-Hörer von r184: Er bleibt an der ERSTEN Geometrie des Render-Objekts hängen. Das Entsorgen der alten Satz-Geometrie (`_chunkSatzGeometrie`) löschte daher die Attribute des noch zeichnenden bauSatz/bodenSatz. Die Diät prüfte sie dann jeden Takt voll.
  - Schnitt an EINEM Ort: `stamm/stoff-instanz.js` `_renderObjektRegister`, `setGeometry` zieht den Hörer zur neuen Geometrie mit.
  - Linse „ATTRIBUTE GELÖSCHT“ in der Diät-Familie (`scripts/lib/diaet-linse.cjs`), Selbsttest grün, scripts −19 Atome.
  - Gegen integ ändern sich nur diese 2 Dateien.
- **Gemessen** (GTX, takt-ABAB 2+2 verschränkt, A = 2160be58 · B = Kopf, Genesis Third stehend, je Boot `lauf 30 --ein 20 --ruhe 300` + `takt 20 --ein 5 --wandern aus` + `diaet`):
  - Linse: A 7 je Frame (bauSatz 6, bodenSatz 1) → B 0.
  - Prüfungen voll je Frame: 8,02 · 7,02 → 1,03 · 1,03.
  - `_diaetRefresh` Spitze/Mitte: 0,71/0,58 · 0,86/0,59 → 0,67/0,53 · 0,61/0,55 ms.
  - `_diaetGeteiltSchreiben` Spitze: 0,34 · 0,51 → 0,27 · 0,34.
  - CPU-Takt p95 (lauf): 6,2 · 7,1 → 6,3 · 6,3 — nicht langsamer, kein Gewinn über der Streuung behauptet.
- **Wände am Merge-Kopf** (9d8f8ef8 = Code des Kopfs): check EXIT=0 · playtest:fast EXIT=0 (21/0) · gate:kamera-treue EXIT=0. Format und lint waren schon vor der Notbremse grün. ci-lokal nicht gefahren (Regel 2).
- **Offen:** Die Zweig-CI an 8210f3e2 ist noch nicht gelesen.

Rohdaten: OMEN `p3/n2110/absage/lauf/{A1n,B1n,A2n,B2n}-*` und `waende/`; hier `bericht/2110-bausatz-absage/` (takt-abab.txt, diaet A1n/B2n, waende.txt).

Status ZWISCHENSTAND + Übergabe: Der Schnitt ist fertig und gepusht, die Zweig-CI läuft. Als Nächstes kommt die GTX-Messschuld 3 am Kopf main 2160be58.
