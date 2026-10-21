# Übergabe 2110 bausatz-absage (NOTBREMSE 98 %, 21.10.)

- **Zweig:** `bausatz-absage` ab integ-probe 97d8ee94, **WIP-Kopf 7a97f1e7** [skip ci] auf origin (Code 7d496480). Worktree OMEN `n2110-absage`, sauber.
- **Befund (korrigiert):** Es gibt KEINE abgesagte Pipeline (an 97d8ee94 keine). Die Ursache ist der Geometrie-Hörer von r184: Er bleibt an der ersten Geometrie, und das Entsorgen der alten Satz-Geometrie löscht die Attribute des noch zeichnenden bauSatz/bodenSatz. Deren Render-Objekte prüfen dann jeden Takt voll.
- **Schnitt:** In `_renderObjektRegister` zieht der Hörer bei `setGeometry` mit (EIN Ort).
- **Linse:** „ATTRIBUTE GELÖSCHT“ in der Diät-Familie. ROT an der Basis (8 je Frame), am Kopf 0. Die vollen Prüfungen fallen 9,1 → 1,2 je Frame.
- **Nächster Schritt:**
  1. Wände: check, playtest:fast, kamera-treue.
  2. takt-ABAB 2+2 neu (`p3/n2110/absage/abab.sh`; B2 fehlt, A2 lief neben einem CI-Job und zählt nicht).
  3. Kopf `[ci voll]`, SHA an den Koordinator.
- Übergabe des Schneiders: OMEN `p3/n2110/absage/uebergabe.md`.
