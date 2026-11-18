# Übergabe ankunft (Pflicht-OFFEN B) — 18.11. 02:35

- Zweig `vorrat8-ankunft`, Kopf **a3ca7ec6** (gepusht, [skip ci]) = main 21f279f5 + der Schnitt (Inhalt 29fb1404 + b65adae6).
- Steht: das Lade-Bild bestellt statt zu rastern (`_ladeBestellt`, `ladeRoh`/`ladeGanz` in stamm/bild-kosten.js,
  stamm/dirigent-ankunft.js `_ankunftsBild`), die Schuld macht jedes Takt-Bild fällig (stamm/dirigent-takt.js), die Umgebung
  ab dem ersten Takt (stamm/bild-himmel.js, Anker in spec/vendor-anker.json); der alte Weg (jedes Lade-Bild rastert) ist weg.
- Zahlen (Radeon 890M kalt):
  - ABAB je 3 unter fremder Last: Kopf 11,96 s (11,02–12,42) ↔ main 18,19 s (14,85–18,51); Haupt-Faden belegt 8,8–9,4 s ↔
    13,1–16,5 s; Pipelines vor dem Bild 42 ↔ 44.
  - In Ruhe war main 11,42 s (ABAB 3) ↔ Kopf 12,19 s (ein Lauf): ein Gewinn in Ruhe ist NICHT bewiesen; Ziel ≤ 8,5 s: 0 %.
  - Gemischter Kopf (je ein Lauf): a3ca7ec6 12,01 s ↔ main 21f279f5 12,85 s.
  - Lücke Kachel 7/3: 11,08 ↔ 10,73 %; Bildmittel 0,81 ↔ 0,81 %; offene Bäume 76 ↔ 4.
  - Gang 60 s Wald, zwei Paare: längstes Bild main 66,9 / 67,0 ↔ Kopf 117,1 / 83,6 ms; Bilder > 50 ms 4 / 3 ↔ 15 / 9; p95 gleich;
    0 synchrone Pipelines; Knoten-Bau im Gang gleich (Σ 638 ↔ 609 ms).
- Tore am Kopf b65adae6: pruefbuehne-licht · hoehlen-sicht · post-kette · stand-takt · welt-boot · takt-atem · foundry-crossfade
  alle EXIT 0. Statik (0 ✗, die Taille ist dicht) und Format grün am a3ca7ec6.
- Bis zur Abgabe fehlt:
  - `gate:v1-pfad` und `playtest` am a3ca7ec6: beide fielen um 00:30 / 01:30 mit 75 (Schloss-Frist, nie gelaufen); neu in der
    Schlange (siehe unten).
  - Der Täter des längeren Gang-Bilds ist nicht benannt.
- Nächster Schritt: v1-pfad und playtest am a3ca7ec6 durch das Schloss laufen lassen, dann stempelt der Koordinator die Abgabe
  mit dem Entwurf.
- Fallen:
  - Das Schloss ist nachts dicht (Punkte-Sitzung mit Vorrang, CI echt); 3600 s Wartefrist reicht nicht.
  - ABAB unter fremder Last ist kein Vergleich.
  - `prettier` auf spec/stamm/modul-karte.json formt die ganze Datei um: nur einzeilig ändern.
  - `_ladeBestellt` braucht `_imTakt === true`, sonst sind die Proben von post-kette blind.
- Bäume: `welle3/ankunft` (Kopf); `welle3/main-9fa4` (Vergleich, detached auf origin/main 21f279f5, sauber).
- Eigene PIDs (Git-Bash): v1nach.sh 1620891 (gpu-lauf 1646298), pt-nach.sh 1635918; Logs in `welle3/vorrat8-mess/`
  (tore.log, tor-v1-pfad2.log, tor-playtest2.log).
- Abgabe-Entwurf: `koord/abgabe-ankunft.txt`; Bildpaar: `koord/ankunft-main.jpg`, `koord/ankunft-kopf.jpg`; Klasse (b) in
  `koord/ankunft-budget.md`.

## Lehre (fünf Zeilen)
1. Zeit kostete das Schloss: rund 4 h Warten in dieser Nacht, zwei Tore verfielen mit 75. Die Mess-Fenster gehören reserviert,
   nicht erwartet.
2. Was trug: `diag-boot-stage --spur` mit einer Probe je Stoff (BOOT_EXTRA) und die Gang-Probe. Nutzlos: das FIFO-Experiment
   und ein ABAB unter fremder Last (main 14,9–18,5 s gegen 11,4 s in Ruhe).
3. Übersehen habe ich, dass der Durchsatz des Knoten-Baus die Grenze ist (Σ 2,4–3,5 s neben ~3 s Jobs). Umordnen verschiebt
   nur, welche Stufe zuletzt kommt; Σ zuerst messen hätte den Auftrag „zuerst ordnen“ früh widerlegt.
4. Ein Auftrag soll tragen: Sockel-SHA, Mess-Bedingung (ruhiges Schloss-Fenster) und eine Machbarkeits-Rechnung zur Ziel-Zahl.
   Er soll nie tragen: eine Ziel-Zahl ohne Durchsatz-Rechnung, und nie eine Bau-Methode (welche Reihenfolge) statt eines Ziels.
5. Der große, nicht beauftragte Hebel: 94,7 % der Knoten-Objekte baut genau EIN Builder, die vier schweren Fragmente teilen
   50 % ihres Texts. Ein geteilter Licht-, Schatten- und Umgebungs-Graph über die Stoffe (Builder-übergreifender Knoten-Cache
   oder ein Programm je Stoff-Familie) halbiert den Knoten-Bau. Das ist der Weg unter 8,5 s.
