# Leser 3 — alte Stationen → Sprossen der Karte 2 (Stück 3)

**Aufteilung.** Quelle: `meisterkarte-quelle/punkte/stationen/g1–g6.js`, 289 Einträge → 282 Schlüssel `kriterium#staffel` (ohne `module.exports.fehlt`, mit `karte2.*` und `breite.*`). Die Familien sind alphabetisch sortiert. Geschnitten wird an der Familien-Grenze, deren Summe 94 bzw. 188 am nächsten liegt.
- Stück 1 (98): affekt 8 · ankunft 6 · bauen 10 · breite 3 · fahrzeug 8 · feld 9 · ferne 7 · gelaende 9 · haar 6 · halten 10 · karte2 5 · ki 7 · klang 10
- Stück 2 (88): leib 10 · licht 7 · lod 6 · luftwasser 10 · material 7 · mensch 8 · oekologie 10 · pflicht 3 · physik 8 · pipeline 9 · profiband 10
- **Stück 3 (96):** schatten 6 · siedlung 10 · speicher 10 · spielgang 6 · stoffe 9 · streaming 7 · studios 10 · tiere 9 · tore 4 · ultiversum 9 · vegetation 7 · wetter 9

**Maßstab.** Der Satz einer Sprosse besteht aus Umfang, Tiefe und Richter (R3). Headless hebt nie (R2), darum ist eine headless-Station höchstens „teil“. Wegen Z3 (Lücken zählen nicht) zählt je Leiter nur die unterste offene Sprosse; Ausnahme ist die Glieder-Leiter `planet.kopplung.wetter-welt`.

**Zahlen (96 Stationen).** Neu „gleich“: **0** · neu „teil“: **35 Zeilen an 34 Stationen** · keine: **52** · dazu 9 Zeilen der Tafel geprüft (6 „gleich“ bestätigt, 1 „fehlt“ bestätigt, **2 Widersprüche**) · 3 Zwillinge der Tafel-Stationen `karte2.*`.

## „gleich“ — nur die bestätigten Tafel-Zeilen (neu: keine)

| Station | Sprosse | Satz der Sprosse (Richter) | Station misst | Vermerk |
|---|---|---|---|---|
| vegetation.K2#1 | leben.pflanzen.kraft S1 | „zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit“ | „nah (0–15 m) …: zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit“ | wörtlich |
| vegetation.K5#2 | leben.pflanzen.jahreslauf S1 | „Kronendeckung Winter ≤ 0,3 × Sommer, Wiese Winter ≤ 0,5 × Sommer“ | Krone 0,018/0,022 × Sommer, Wiese-LAI 0,356 × Sommer, Frühling | drei Posen statt Zeitraffer |
| siedlung.K4#2 | mensch.zeit.palimpsest S1 | „Häuserzahl über 1 500 s steigt, alte ≥ 0,9 erhalten“ | „Häuser 12 → 20/20, die alten 0.917“ | S1 gebucht |
| speicher.K4#2 | same.entfaltung.akte S1 | „10² Taten … Bildpaar vor ↔ nach Reload ≤ 1 % Diff“ | Code: `soll ≥ 100` Taten vor UND nach dem Laden | **Stand veraltet:** GRUEN stammt aus der Drei-Taten-Form, die 100-Taten-Form ist nie gemessen |
| siedlung.K1#2 | mensch.bau.innen S2 | „10 Häuser des Start-Dorfs, innen lesbar · Spielgang aller Häuser im echten Fenster“ | 17/17 Gänge, innen lesbar 6/17 | ROT an beiden Geräten |
| wetter.K1#2 | planet.wetter.lagen S1 | „Regen an A bei trockenem B ≥ 20 % der Zeit, Lag ±20 %“ | 40 %, Lag 240 s (Soll 273 ±20 %) | Radeon GRUEN in `messung/3984539f-radeon.json`, steht nicht in stand.json |

**Widersprüche zur Tafel (dort „gleich“, hier „teil“):**
- `tiere.K5#1` → `leben.oeko.vielfalt` S1: Das Glied der Tiefe „Art passt zum Lebensraum (Hirsch Wiese, Bär Fluss)“ misst die Station nicht (6 Sichtungen, meist „wesen“). Die GTX hat keine Zahl.
- `vegetation.K4#1` → `leben.kopplung.stadt-im-netz` S1: Das Glied der Tiefe „Waldsaum am Ort“ wird nicht gemessen. 7 von 58 Boxen stehen ungemessen, der Satz verlangt aber „jede Haus-Box“. Auch der Gegenlauf R7 der Kopplungs-Leiter fehlt.

## Die fünf lohnendsten „teil“ (die Station steht schon an der GPU oder ist nur eine Schwelle entfernt)

1. `streaming.K3#1` → `same.massstab.sprung` S1. Größe und Pose sind dieselben (Sprung 1 km, p95, t(ganz), beide Geräte). **Fehlt:** das Soll p95 ≤ 33 ms (heute ≤ 50) und ganz ≤ 30 s anlegen und die Lücke-Bilder zählen. Heute fiele die Station: Radeon 41,9 ms bei 45–58 s, GTX 49,9 ms.
2. `siedlung.K4#1` → `mensch.zeit.palimpsest` **S2**. „Überdeckung je Slot ≥ 0,9 über 1320 → 1935“ steht wörtlich da (0,915), aber nur headless. **Fehlt:** dieselbe Zahl im echten Spiel mit Zeitsprung ≤ 5 s. Weil S1 gebucht ist, hebt das HEUTE ohne Lücke.
3. `siedlung.K4#2` → `mensch.kopplung.antwort` S1. Der Ring um das Spielerhaus binnen 1 500 s steht im Wert (Ring 9 neu). **Fehlt:** der Gegenlauf im selben Lauf (dieselbe Saat ohne Spielerhaus → kein Ring).
4. `tiere.K1#2` → `leben.tiere.masse` S1. Die Bild-Serie urteilt schon „EIN Pulk“ über die Zahl der Flecken. **Fehlt:** eine Herde mit 10 Gliedern (heute 5) und der Schuss Ego auf 40 m (heute 46–57 m).
5. `tiere.K2#2` → `leben.tiere.verhalten` S1. Die Probe steht schon am Wolfsrevier, beide Geräte GRÜN. **Fehlt:** ein Zeitraffer über 24 Spielstunden im Fenster, aus dem Zeitbudget ±20 % und Riss-Quote 20–40 % gezählt werden (heute nur headless: tiere.K4#2, tiere.K2#1).

Knapp dahinter: `schatten.K1#2` → `erleben.bild.flaeche` S1 (es fehlt nur Albedo ±0,05 für 5 Stoffe). `wetter.K2#1` → `wetter-welt` S3 (sie hat schon einen Gegenlauf fürs Luma-Glied, nämlich den trockenen Innenraum unter dem Dach; es fehlen nur die Pfützen r ≥ 0,5 im Fenster). `spielgang.K3#1` → `same.preis.eingabe` S1 (INP über den v1-Pfad, Schwelle ≤ 100 ms).

**Zwillinge (G4):** `siedlung.K2#1/#2` messen dieselbe Sprosse wie die Tafel-Station `karte2.mensch.stadt.siedlungsnetz#1`. `spielgang.K5#1` misst dieselbe wie `karte2.same.preis.zugang#1`.
**Nicht gefunden:** nichts. Alle 96 `quelle`-Texte und alle Sprossen-Texte lagen vor. In stand.json tragen 27 Paare aus Station und Gerät ein ROT ohne Zahl, z. B. tore.K1#1, studios.K2#2–K4#2, tiere.K1#2, vegetation.K1#1/K3#1 und schatten.K5#1 an der Radeon. In leser3.json steht für sie „keine Zahl im Stand“. Die neueren Werte, die ich unter „fehlt“ zitiere, stammen aus `messung/*.json`.
Daten: `leser3.json` (Zeilen mit sprosseText · stationMisst · fehlt) · Hilfslisten `leser3-karte2.txt`, `leser3-leitern.txt`, `leser3-stationen.txt` · Bau `leser3-bau.cjs`.
