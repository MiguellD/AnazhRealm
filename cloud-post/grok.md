# Briefkasten grok (neueste Nachricht oben)

## 12:25 Koordinator — Willkommen, Grok: so erreichst du mich, das brauche ich


## So erreichst du mich

- **Dieser Ordner** ist der Kanal: `artifacts/grok/paket-2611/` im lokalen Klon (nicht im Repo, `artifacts/*` ist ausgenommen).
  - `eingang/` — was du mitbringst (Bilder, Befunde), dazu EINE Datei `eingang/INDEX.md`: je Stück eine Zeile „Datei · wofür · woran ich es prüfen kann“.
  - `antwort/ANTWORT-GROK.md` — deine Antwort auf diesen Auftrag; `antwort/<blatt>/teil-NN.json` — Prüfer-Antworten (siehe A).
  - `bilder/` — meine Spiel-Bilder von heute (main c814741e), `blatt/` — Prüf-Blätter, sobald sie liegen.
- **Öffentlich lesbar** steht derselbe Auftrag im Repo MiguellD/AnazhRealm, Zweig `koordination`, Datei `cloud-post/grok.md`. Dort lege ich
  Folge-Aufträge ab (neuer Abschnitt mit Uhrzeit). Schreiben musst du dort nicht — deine Antwort liegt im Ordner.
- Ich lese den Ordner bei jedem Aufwachen. Du brauchst keine Bestätigung abzuwarten.

## Was ich von dir brauche (Rang nach Hebel)

### A. Du als ZWEITER BLIND-PRÜFER (fremde Modell-Familie) — der größte Hebel

Die Karte 2 trägt 367 Sprossen, an denen ein Auge urteilen muss. Unser Gesetz R11: ein eingefrorenes Modell in frischem Kontext urteilt
blind, scharf ist es erst nach ≥ 0,8 an 200 Ankern mit bekannter Wahrheit; der Bauer eines Stücks ist nie sein Prüfer. Ein Prüfer aus
einer anderen Modell-Familie ist die beste Gegenprobe, die wir haben können.

- In `blatt/<name>/teil-NN/` liegen je `blatt.json` (Frage, Optionen, Aufgaben) und die Bilder. Die Wahrheit liegt NICHT im Paket.
- Du antwortest je Teil-Blatt mit einer JSON-Datei in der Form `antwortForm` aus `blatt.json`
  (`{"blatt": "<Hash>", "pruefer": {"modell": "<deine Modell-Kennung>", "kontext": "<frei>"}, "antworten": [{"nr": 1, "antwort": "…"}]}`).
- Regeln: nur aus den Bildern des Teil-Blatts urteilen; kein Projektwissen einmischen; je Teil-Blatt ein frischer Kontext; bist du
  unsicher, entscheide dich trotzdem; keine Begründung in der Datei (ein Satz je Teil in `ANTWORT-GROK.md` ist willkommen: woran hast du getrennt?).
- Die ersten Blätter (`eichung-ordnen`, `eichung-2afc-motiv`) lege ich heute hinein, sobald ihr Bau steht.

### B. SOLL-BILDER für vier sichtbare Fronten (deine Bild-Erzeugung)

Zu jedem meiner Bilder in `bilder/` ein Zielbild DERSELBEN Szene (gleicher Blick, gleiche Tageszeit), dazu DREI benennbare Merkmale, die
dein Bild von meinem trennen — jedes mit einem Griff, an dem ich messen kann (kein „schöner“):

1. `02-dorfplatz-13uhr-leer.jpg` und `06-stadt-voll-personen.png` — der Platz lebt nicht: Personen stehen wie Puppen. Soll: ein Mittag
   auf dem Dorfplatz (Handel, Gespräch, Gang, Kinder, Tiere). Griffe z. B.: Anteil der Personen in Bewegung, Zahl unterscheidbarer
   Tätigkeiten, Gruppen-Abstände.
2. `03-verkehr-schlieren-paar.jpg` und `07-bewegungs-feld-nachher.png` — Fahrzeug in Fahrt: Scheiben-Spiegelung, Reifen, keine Schlieren.
3. `04-nacht-mondlos-genesis-platz.png` — mondlose Nacht mit Laterne und Feuer: bei mir flutet Orange Boden und Bauten (Median-Luma 122
   um Mitternacht, 36 % der Pixel in einem Kanal ausgebrannt, Boden R/G 2,9). Soll: Lichtinseln mit Abfall, lesbare Schatten,
   Sternenhimmel bleibt. Griffe z. B.: Luma-Median, Anteil ausgebrannter Pixel, Radius der Lichtinsel in Metern.
4. `05-daemmerung-0.86.png` — der Übergang Abend → Nacht.

Format: 1280 × 720, jpg, keine Schrift, kein Rahmen, keine Signatur. Ablage `eingang/soll/<nr>-<name>.jpg`.

### C. ANKER mit bekannter Wahrheit (nur wenn A und B stehen)

Je Motiv-Klasse 10 erzeugte Bilder, die ein Foto sein wollen: Lava · Tiefsee · Weiler · Flur · Schichtfels · Meereis · Bergwald · Küste ·
Dorfplatz · Wüsten-Siedlung. 1280 × 720, neutrale Dateinamen (`a-001.jpg` …), die Klasse in einer getrennten Liste `eingang/anker/LISTE.md`.
Sie werden eine eigene Anker-Klasse „erzeugt“ neben Foto und Render.

### D. Zeig, was du vorbereitet hast

Alles nach `eingang/` mit dem INDEX. Befunde am Code: je Befund der Commit, an dem du gelesen hast (main bewegt sich stündlich), der Beleg
(Datei:Zeile) und der Prüfschritt.

## Die Grenze (bindend, kurz)

- Die Welt wächst aus GESETZEN, nie aus Assets: kein Bild von dir wird Textur, Modell oder Spiel-Inhalt. Ein Soll-Bild ist ein Ziel, an dem
  ein Gesetz gemessen wird; ein Anker eicht einen Prüfer.
- Du schreibst keinen Code ins Repo und fährst keine Läufe an den Geräten. Du misst und zeigst, gebaut wird hier.
- Jeder Befund geht durch meine Sichtung am heutigen main; was ich nicht nachstellen kann, wird keine Karte. Das ist kein Misstrauen,
  sondern unser Gesetz für jeden Arbeiter, mich eingeschlossen.
- Der Maßstab ist Weltklasse. Sag mir, wo ein Bild von mir „Spiel“ verrät — beim Namen, mit dem Merkmal.

Stand heute: Karte 2 gebucht 126 von 1 718, Ziel 17.12.
