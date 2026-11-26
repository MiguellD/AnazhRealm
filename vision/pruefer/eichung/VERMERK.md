# Vermerke zu den Eichungs-Akten (26.11.)

Die Akten tragen ihre Prüfsumme; was über sie zu sagen ist, steht darum hier daneben.

## Das Größen-Leck: die Eichung 2afc × paar gilt nicht

Das Eich-Blatt `eichung-2afc-motiv` (222 Paare in 9 Teilen) verriet die Wahrheit außerhalb des Bildes: die Regel
„die größere Datei ist das Foto“ trifft 203 von 222 = 0,914, ohne ein Bild zu öffnen (ein Foto trägt mehr Bytes
als seine gestörte Fassung oder ein Render). Geprüft am ganzen Blatt, nicht an fünf Aufgaben: Name (Nummer und
Seite, per Saat gemischt: richtig = A an 0,459), Maße (alle 480 × 320), Metadaten (kein Exif, kein Kommentar),
Dateizeit (70 % der Paare gleich, sonst ohne Richtung), Dateigröße (0,914 — das Leck).

Beide Akten 2afc × paar lagen an diesem Blatt und liegen darum unter `leck-2611/` — der Leser (`eichDatei`)
nimmt nur Akten aus diesem Ordner selbst, eine Sprosse der Art 2afc urteilt „ungeeicht“, bis ein Lauf am dichten
Blatt liegt:

- `leck-2611/2afc.paar.claude-haiku-5-5-low.c0b2fcc0.json` — 211 von 222 (0,950); von der Größen-Regel (0,914)
  nicht zu trennen.
- `leck-2611/2afc.paar.grok-bot.c0b2fcc0.json` — 222 von 222; über der Größen-Regel, aber am selben Blatt.

Gestopft im Blatt-Bau (`pruefer.cjs blattBauen`, Selbsttest-Täter GRÖSSEN-LECK): jedes Bild eines Blatts liegt
in derselben Bytezahl und mit derselben Dateizeit. Das dichte Eich-Blatt ist neu zu bauen und neu zu fahren.

## Das Blatt ordnen × klasse: kein Leck gefunden

`eichung-ordnen` (220 Aufgaben in 10 Teilen, 7 Klassen): die Dateigröße allein trifft die Klasse an 0,200
(Zufall 0,143), der Nachbar im Blatt trägt dieselbe Klasse an 0,109 (unter Zufall), Maße alle 480 × 320, kein
Exif, die Dateizeit steigt nur mit der Nummer. 100 % sind hier die Aufgabe selbst: sieben Motive, die das Bild
auf einen Blick trennt (Tiefsee, Schichtfels, Weiler, Feld und Ernte, Lava, Galaxie, Meereis). Die Eichung sagt,
dass der Prüfer sieht — nicht, dass er feine Unterschiede trennt.

## Der zweite Prüfer „grok-bot“

- `ordnen.klasse.grok-bot.d568b019.json` — 200 von 200, scharf.
- `ordnen.folge.grok-bot.0aae16de.json` — 18 von 20, urteilt nicht (20 Anker < 200).

Grok lief NICHT mit dem eingefrorenen Auftrag: seine Akten tragen den Standard-Hash des Auftrags-Texts
(`pruefer-auftrag.md`), sein Kontext ist fremd und ohne Projekt-Vorspann, der Text, den er bekam, ist nicht der
zwischen den Marken. Nach R11 (Prüfer = Modell + Effort + Auftrags-Text) ist der Hash in diesen Akten darum eine
Behauptung ohne Beleg; wer mit „grok-bot“ eine Sprosse urteilt, friert zuerst seinen Text ein und eicht neu.
Gefahren hat die Läufe der Koordinator (der Bauer der Blätter fährt nie einen Prüfer).

## Das dichte Blatt 2afc × paar (26.11. 14:36): scharf ohne Größen-Leck

Neu gebaut mit Saat 2 (`eichblatt.cjs --nur eichung-2afc-motiv --saat 2`, Bauer koordinator-radeon): 222 Anker in 9 Teilen, alle
Bilder eines Teils in EINER Bytezahl (Teil 01: 48 Bilder, 1 Größe). Neun frische Kontexte „claude-haiku-5-5·low“ mit dem
eingefrorenen Auftrag: **214 von 222 = 0,964** (Intervall 0,930–0,984; fremd 46 von 47, Störung 168 von 175, keine Schlagseite) —
Akte `2afc.paar.claude-haiku-5-5-low.4b0a14b7.json`. Die Größen-Regel trägt am dichten Blatt nichts mehr (eine Größe je Teil).
Offen: der zweite Prüfer (grok-bot) ist am dichten Blatt nicht gefahren; seine Akte unter `leck-2611/` gilt nicht.
