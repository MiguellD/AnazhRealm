# Übergabe 1410-3 (CPU-Takt) — Stand 14.10. abends, Woche ~97 %

**Status: ZWISCHENSTAND + Übergabe.**

- **Zweig** `takt-wurzel`, Kopf **1cab2313** [ci voll], CI 38611878940 (Ergebnis siehe Nachtrag bzw. Actions):
  - der Schnitt 872ffeec, „je Frame höchstens EINE Schatten-Kaskade“;
  - der Merge von main-naechst 0377737d (V18.546.1);
  - bd87abed (die ABAB-Zahlen im Kommentar);
  - eef150bc + 1cab2313, die Bewegungs-Regel (Entscheid (b)).
- **Wo das Band steht** (stehend, ABAB gegen d47efac7), CPU-Takt p95:
  - Wiese Ego 5,8 (hält);
  - Wiese Third 6,4;
  - Genesis Ego 6,3;
  - Genesis Third 7,5 ms.
  - Gehend gilt das alte Gesetz, dort kein Gewinn. Siehe `1410-3-takt.md`, Nachtrag.
- **Der nächste Schritt** (benannt in `1410-3-takt.md`, je Frame Genesis Third):
  1. Die Kreaturen außerhalb des Bilds an den Schirm binden (Gebot 7). `updateCreatures` kostet 0,75 ms mit 0 Tieren im
     Bild, darin `_tickKreaturZiegel` 188 µs und der Hüllen-Kontakt 111 µs. Erwartet −0,3 bis −0,5 ms.
  2. Der Render-Objekt-Pfad je Befehl (r184 `renderObject` → `_renderObjectDirect`, ≈ 30 µs je Befehl, 106–140 Befehle
     an Genesis).
  3. `updateMatrixWorld` (0,44 ms Selbstzeit) für statische Unterbäume, nur mit einer Linse für später angehängte Kinder.
- **Werkzeug:**
  - `p3/k1410g`:
    - `prof.sh`: CPU-Profil je Frame;
    - `zaehl.sh` / `zaehl2.sh`: die Diät je Frame;
    - `schatten.sh` und `bewegung.sh`: zwei Gesetze in EINER Sitzung, stehend und gehend.
  - `p3/k1410h`: ABAB-Serie mit Überspringen gemessener Boots.
  - `p3/k1410c/profil-diff.cjs`: das Profil je Frame normiert.
- **Messbäume:** `abab-pd47` (A), `abab-id47` (Instrument, Wiese K55 lokal).
