# front-druckwelle — die Druckwelle (same.physik.reaktion#2), ZWISCHENSTAND zur Vorprüfung

GTX 1050, 22.11.2026 · Zweig `front-druckwelle` (front-brand 73d2f6d39 und main ad4dede44 V18.546.363 eingemischt) · Karte 2 gebucht 44 von 1 718

## Geschnitten

- **Das Gesetz im Kern** (schmiede-core `STOFF_GESETZ`, neben `tragSpannung`): `druckwelle(energieJ, R, luft)` → skalierter
  Abstand Z, Überdruck Δp, Impuls, Dauer, Ankunft; `druckRadius`, `plattenLast`; EINE Spalte `q` (J/kg), EINE Zeile mit q:
  der welt-eigene Stoff `donnerkorn` (1 MJ/kg — eine Zahl, keine Rezeptur).
- **EIN Schreiber** `_druckWelle(ort, energieJ)` (stamm/feld-brand.js): je Körper im Radius EINE Frist zu seiner Ankunft,
  `_tickDruck` löst sie ein (Bild-Budget 4 ms, Rückstand höchstens `DRUCK.verzugS` 0,25 s plus ein Takt, eine Ladung wartet
  nie; das Budget steht mit Grund „frist“ in der Uhr-Tafel spec/uhr/geraetezeit.json).
- **Der Auslöser im echten Spiel:** das Feuer erreicht eine Stoff-Zeile mit q — `_brandZuenden` → `_ladungZuenden` (Frist aus
  der Brand-Ellipse der Zelle) → `_ladungUmsatz` → `_druckWelle`. Fackel (Taste 9 + Maus, Verb „zuenden“) und Feuerfront
  gespielt; das Brennglas gelesen (derselbe Pfad, `_brandEntfachen` ruft `_tickDruck` synchron).
- **Leser — nur bestehende, je Wirkung beim Namen:**
  - Werk-Teil: `_druckWerk` → `_druckTeilLast` (Kern `plattenLast`) → `_werkBricht`
  - freier Körper, Kreatur, Wagen: `_druckStoss` (Impuls × Fläche ÷ Masse durch den Schwerpunkt) → `_stossAuf`
  - Spieler: `_druckStoss` → `_stossAuf` → `_spielerStoss` → koerper-core `leibStossMerke`
  - Ohr: `_substanzKlang("knall", { dp, dauer })` → klang-core (Puls unter der Friedlander-Hülle + Grollen, Knoten-Graph)
  - Chronik: EINE Zeile `journal.ladung-bruch` / `journal.ladung` (`_druckEnde`)
- **Schnitt in fremder Wurzel (Leib, koerper-core `leibStossSchritt`):** ein Fuß außer Reichweite des Beins schob den
  Schwerpunkt ohne Grenze weiter — ab 3,5 m/s Stoß wuchs die Fahrt ohne Ende (der Spieler 1 m neben dem Fass: 282 m/s, 326 m
  in 6 s). Jetzt wirkt das Pendel nur, solange |Schwerpunkt − Fuß| ≤ schrittBein × Bein. Linse gate:koerper-kern S8 mit der
  Mutante `ohneReich` (vorher ROT: 15 241 m/s). Stöße ≤ 1,5 m/s sind bahn-gleich (S1–S7 unverändert).
- **Kosten an der Wurzel:** der Rest eines gebrochenen Werks erbt den geräumten Grund seines Werks (`grundErbe`, kein zweites
  Räumen), die Geburt einer Scherbe 4,08 → 0,90 ms, der Einsturz je Werk 7,1–7,8 → 5,5 ms (Lauf w10 am Endstand, 39 Brüche in
  einem Bild; über 34 Bilder verteilt maß der Lauf davor 0,66 und 4,06 ms), Scherben schlafen nach 1,5 s.
- **Linse** (Familie gate:stand-takt): Marke `druck` in SIMS, je Ereignis sein Soll (Umsatz, Schreiber, Blick, Stoß, Last,
  Bruch, Scherbe, Ende), DRUCK-ERBE mit der Mutante der Klasse in JEDEM Lauf (ungesehen = BLIND), Selbsttest-Zeilen.

- **Vier Täter der statischen Kette, vor der Vorprüfung geheilt:** `Math.random` im Knall-Graph (Ein-Schreiber-Wand) → die
  Stelle im Rausch-Vorrat folgt der Uhr des Ereignisses · `_tickDruck` ohne Grund an der Gerätezeit (WANDUHR) → Grund „frist“ ·
  das Verzeichnis der Blocker erreichte über `_ladungTeile` den Netz-Bau unter einem fremden `catch {}` (Stoff-Wand) → es
  fragt nur noch, OB ein Teil q trägt, das Volumen rechnet der Umsatz · `Object.create` für den Plan des Einsturzes
  (Zwillings-Wand) → eine Kopie.

## Gemessen (GTX 1050, werkbank --echt, Mess-Wiese −280,4/−1045,6)

| Maß | Zahl |
| --- | --- |
| Bruch-Grenze einer Scheibe, gerechnet (Fass 60,6 MJ) | 29,98 m (Z 12,30 · Δp 7 644 Pa · Impuls 38,9 Pa·s) |
| Bruch-Grenze gemessen, drei Strahlen à 25–28 Probe-Fenster | 30,32 · 29,83 · 29,81 m = +1,13 · −0,52 · −0,56 % |
| Fackel-Pfad (echte Tasten): Scheiben nach dem Gesetz | 7 von 7 (22/26/28 m brechen, 30–38 m stehen), Umsatz 0,000 s nach dem Klick |
| Feuerfront-Pfad (Funke 4,48 m luvwärts): Frist gerechnet ↔ Umsatz | 59,901 s ↔ 59,914 s, 7 von 7 Scheiben |
| Kiste in 6 m / 12 m | 0,301 m / 0,087 m |
| Spieler in 5,0 m (dv 2,864 m/s) | 3,70 m (vor dem Leib-Schnitt 13,4 m) |
| Spieler in 1,0 m (dv 4,425 m/s) | 16,2 m in 5,8 s, steht (vor dem Schnitt 326 m, 282 m/s) |
| 78 Probe-Fenster, 52 Brüche, 208 Scherben: Bilder der Welle | ohne Budget 7 Bilder, schwerstes 595 ms, Summe 1 698 ms · Budget allein 34 Bilder, 122 ms, 2 772 ms, letzter Bruch 2,63 s spät · jetzt 8 Bilder, 478 ms, 1 646 ms, letzter Bruch 0,27 s |
| wer die Bilder der Welle trägt (Profil) | der Löser der Scherben 48 %, das Zeichnen 27 %, der Takt der Welle 6 % |
| Linse gate:stand-takt am Endstand ab4c6afbe (ruhige Maschine, `linse-stand-takt.txt`) | GRÜN: Schreiber 2 245 Einheiten bei 71 Bauten, Umsatz 38, Bruch 1 044 · 1 780 · 1 084 · 1 095, Rückstand 0,032 s (Soll ≤ 0,35), Schlaf 1,5 s, Kiste 6 m dv 1,542 = Soll, die Mutante räumt 4× |
| statische Kette `npm run check:statik` am Endstand, ein Durchgang | Exit 0; dazu format:check, stamm:lint, gate:schmiede-contract Exit 0 |

Bildpaare, selbst angesehen (je dieselbe Pose): `fackel-vor.png` ↔ `fackel-nach.png` (Kopf 374d11363), `front-vor.png` ↔
`front-nach.png` (Stand f5198eec7, vor Leib-Schnitt und Takt), `probe78-vor.png` ↔ `probe78-nach.png` (Lauf w10).
**Was ein Art Director daran Amateur nennt:** die Welle selbst hat kein Bild — kein Blitz, kein Staubring, kein
niedergedrücktes Gras; zu sehen sind der Brand der Zelle (Flamme, Rauch) und fehlende Scheiben, die Scheibe zerfällt in vier
gleiche Stücke, und der Leib stolpert 16 m rückwärts, statt zu stürzen.

## Ehrlich offen (beim Namen)

- Fensterzustand je Öffnung der Studio-Häuser (außerhalb, laut Auftrag: Studio-Guss, Goldens).
- Freifeld: keine Abschattung, keine Bodenreflexion; Last = Δp·|cos|; die Impuls-Formel liegt im Nahfeld Z < 1 um −36 %.
- Nur Kasten-Teile sind Platten; gewachsene Natur und Studio-Werke stehen; Wagen werden gestoßen, brechen nicht; der Stoß ist
  waagrecht; kein Krater. Der Wagen-Pfad ist im echten Spiel nicht gespielt (gate:fahr-leben, Flachkörper-Probe: 19 min an der
  GTX 1050 — nur in der vollen Batterie).
- Kein Schaden am Leib aus Überdruck (hp 134 → 134 in 1 m); der Leib kennt keinen Sturz (7 m/s → 60 m Auslauf, 10 m/s → 213 m).
- Kein Bild der Welle selbst (Blitz, Staub, Druckring); die Länge des Grollens ist eine gesetzte Zahl; das Ohr ist headless
  ungehört.
- Der Stoff hat keine Quelle in der Welt (nur Schöpfer-Katalog; das Donnerfass kostet 1 donnerkorn); die Fackel aus holz + glut
  zählt in der Rollen-Tafel als „Trank“ (kampf.js).
- Eine Welle in Fahrt wird nicht gespeichert; Mehrspieler ungeprüft (Wanduhr-Budget im Takt); keine Kette zwischen Ladungen.
- Der Löser bei ≈ 200 wachen Scherben: 18,6 ms je Schritt, 5,8 Schritte je Bild im Nachholen des Loops — das schwerste Bild
  der Probe (478 ms) gehört ihm (Wurzel Takt, OMEN).
- Die Mutante der Linse kostet +32 s je Lauf.
- Die Linse stand-takt wackelt unter CPU-Last an WECKEN (nicht an der Welle): ein Lauf neben meiner eigenen statischen Kette
  fiel ROT — nach 30 stillen Takten kamen noch 4 Kacheln der Nah-Streu (724 Einheiten), `_weltOffen` nennt sie nicht offen;
  davor und danach auf ruhiger Maschine GRÜN (Σ 0). Wurzel Takt (OMEN), hier nur benannt.
- Lokal NICHT gefahren (über dem Hand-Halt der GTX 1050): gate:haus-fern, gate:klang-zensus ganz (≈ 560 s; belegt ist (Ü) 39 von
  39), gate:fahr-leben (19 min).
