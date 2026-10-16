# Auftrag 16.10. (Koordinator, neue Woche) — OMEN: die Echt-Gruppe wird ganz grün

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend. Entscheide aus `bericht/1610-echt-erstlauf.md` und
`bericht/1610-frost-echt.md`: beide gefallen, unten. Reihenfolge = Wert; zwischen den Schritten keine Rückfrage, Berichte als
ZWISCHENSTAND in `bericht/1610-echt-*.md`, Nachricht nur „neue Datei X + Urteil“.

## 1. Weg R — ENTSCHIEDEN: ja

`C:\actions-runner\.path` mit `C:\Program Files\Git\bin` vorn, `C:\actions-runner\.env` mit
`npm_config_script_shell=C:\Program Files\Git\bin\bash.exe`, Läufer-Dienst neu starten, Beleg (Which2 im Worker-Log zeigt
Git-Bash) in den Bericht. Den Re-Run des Jobs `echt` an integ-probe 826717ed fahre ICH per API, sobald dein Bericht da ist.

## 2. Frost-Wand auf der Karte — Werkpaket, Zweig `frost-echt` ab integ-probe 826717ed

Ein Schnitt, netto ≤ 0 Zeilen in `scripts/` (DECKE):
- (a) `scripts/diag-weltbild-frost.cjs`: die Boot-Wartung wartet im `--echt`-Weg auch auf `state._weltbildDa` (dein
  Vorschlag, dieselbe Zeile). Besser noch: auf `_weltbildDa` in JEDEM Weg, wenn swiftshader dabei nicht über die Frist läuft
  — die Wand soll das Bild urteilen, nicht den Ladeschirm. Entscheide nach Messung.
- (b) die T2-Lücke von `welt-boot`: die absichtliche Selbsttest-Meldung zählt nicht als Welt-Fehler (an der Wurzel:
  der Selbsttest meldet sich als Selbsttest, kein Muster-Filter auf den Meldungstext).
- (c) der falsche Index-Satz in `diag-ci-deckung` fällt; ist die Wand auf der GTX grün, fällt die ganze AUSNAHME
  `gate:weltbild-frost:echt` und die Wand kommt in die Liste des Jobs `echt` (Kopf-Kommentar in check.yml mitziehen).
- BEWEIS: `npm run gate:weltbild-frost:echt` auf der GTX vorher ROT (B 2,65/2,46 %) → nachher GRÜN (Exit-Zeile, Bilder
  zeigen die Welt, nicht den Ladeschirm); `npm run gate:weltbild-frost` (swiftshader) weiter grün; `npm run check` grün;
  Push mit `[ci voll]`. Ich merge nach Zweig-CI.

## 3. Die vier roten GPU-Schritte auf der Karte — Täter beim Namen

Albedo-Tafel · Ego-Schatten · Verdeckungs-Abfrage · WebGL2-Rückfall (die Liste im Kopf des Jobs `echt`). Je Schritt: auf der
GTX fahren, Täter beim NAMEN (Linse oder Spiel? Datei:Zeile, Zahl, Bild), Bericht `bericht/1610-echt-vier.md`.
- Ist der Täter die LINSE (Wanduhr, Boot-Wartung, swiftshader-Annahme): auf demselben Zweig `frost-echt` schneiden, netto ≤ 0,
  der Schritt kommt in die Liste.
- Ist der Täter das SPIEL: nicht schneiden — der Bericht nennt Methode, Zahl, Bild; ich setze die Karte.

## 4. Danach (Werkpaket, nie Standby)

Melde dich mit dem Kopf von `frost-echt`. Der nächste Messauftrag (ABAB des ersten Bündels dieser Woche gegen main aa74c324,
Wiese + Genesis × Ego/Third) kommt, sobald integ-probe ihn trägt.
