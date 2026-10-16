# Bericht 1610 FZ — Weltbild kalt: A = 1d831571 (27ae78bf^) gegen B = 27ae78bf (FW, 14f7eafe)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 16.10. (B-Verdacht aus wand-zeit fada5603): `diag-boot-stage --kalt --echt` je
2 Boots, Weltbild-Zeit + Phasen. Ist B langsamer, die Täter-Zahl.

## Urteil

**B ist nicht langsamer. Das Weltbild kalt steht auf der GTX gleich schnell. Auf swiftshader liegt B um +2 s (~3 %) innerhalb der
Boot-Streuung.**

Den CI-Sprung (47–78 → 75–185 s) zeigt der kalte Boot auf dem OMEN nicht, auch nicht auf 4 Kernen wie ein GitHub-Runner. Das
passt zum FZ-Schnitt selbst (fada5603): Die 185 s waren die Wartezeit der Fenster-Wand-Linse. `uferStellen` wartete dort auf das
ganze Weltbild, also ein Linsen-Fall und keine Ankunft des Spiels.

| Bedingung | A 1d831571: t(Weltbild) s | B 27ae78bf: t(Weltbild) s | Mittel A → B | Urteil |
|---|---|---|---|---|
| GTX, `--echt` 1920×1080, 4+4 | 21,60 · 21,45 · 21,74 · 21,14 | 23,42 · 21,64 · 21,58 · 21,14 | 21,48 → 21,95 (Δ +0,47, 2σ 1,48) | nicht langsamer; ohne B1 gleich |
| swiftshader, 12 Kerne, 2+2 | 64,25 · 68,54 | 72,70 · 64,97 | 66,4 → 68,8 | im Rauschen (A streut 4,3 s) |
| swiftshader, 4 Kerne (Affinität 0xF, auch der GPU-Prozess), 2+2 | 65,30 · 65,16 | 69,16 · 65,44 | 65,2 → 67,3 | im Rauschen |

**Phasen, GTX-Mittel 4+4, A → B (s):**
- Erst-Bau: 64,8 → 65,5 Pipelines, 3,2 → 3,3 s.
- Kosten auf dem Haupt-Thread: Bauten 0,6 = 0,6, Streu 1,8 = 1,8, Boden 0,6 = 0,6, Gruppen-Bau 0,3 = 0,3. Blockiert 15,1 → 15,2.
- Zuletzt offen:
  - „Bäume und Bauten wachsen“ 21,4 → 21,8
  - Pflanzen 12,0 → 12,4
  - Wald-Gestalt 18,6 → 18,5
  - ferne Bäume 17,7 → 17,4
  - Dorf 18,3 → 18,2
  - Horizont 14,8 → 15,3
- Settlement-Anfrage zurück 12,8 → 13,8, Buch 6,4 → 6,7.

**Der Ausreißer B1** ist in allem später, auch beim Boden (8,3 statt 7,2) und beim Buch (7,2 statt 6,6). Das ist ein langsamer
Boot im Ganzen, keine Phase.

**Nebenbefund:** A zeigt in 2 von 4 GTX-Boots „Destroyed texture [horizont-karte] used in a submit“ (A1 8×, A4 1×), B in keinem.
Das ist die Fehler-Klasse, die FW an der Wurzel schließt; sie ist auf der Karte bestätigt.

## Methode

- **Wer gegen wen:**
  - A = 1d831571, der erste Elter von 27ae78bf. Der Diff ist genau der FW-Merge: `stamm/07.js` (+10, der Hunk 1420/1467),
    `11b.js`, `20c.js`, `25a.js`.
  - Den Elter von 14f7eafe (0d6c8bc1) habe ich nicht genommen. Ihm fehlt B3 Ladeschirm-Takt, das würde die Ankunft vermischen.
- **Instrument:** Jede Seite misst aus ihrem eigenen Baum (abab-i1d8, abab-p27a). Die Kalt-Zeile ist an beiden gleich:
  `diag-boot-stage.cjs` unverändert, `welt-boot` nur um `uferStellen` ergänzt.
- **Boots:** Leeres Profil je Boot, GPU-Schloss je Boot.
- **4 Kerne:**
  - `start /affinity F` vererbt sich auf Chrome, aber der GPU-Prozess (dort läuft swiftshader) setzt sie zurück.
  - `affin.ps1` hält ihn alle 250 ms auf 0xF.
  - Ein erster Versuch ohne diesen Wächter ist verworfen.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `bericht/1610-fz-weltbild/`.
  - je Boot `.json` und `.txt`: A/B GTX, sA/sB swiftshader 12 Kerne, qA/qB 4 Kerne.
  - `auswertung.md` (alle Phasen je Boot), Skripte `serie*.sh`, `affin.ps1`, `auswertung.cjs`.
  - Auf dem OMEN: `p3/k1610fz/`.
- **Vorschlag:** Keine Spiel-Karte für B aus 14f7eafe. Bleibt eine CI-Zahl zu prüfen, dann bitte mit dem Schritt, der sie misst; ich
  fahre ihn hier auf swiftshader.
