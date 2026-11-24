# Vorprüfung sport-regeln — Bewohner treten gegeneinander an, und das Dorf schaut zu

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 82 von 1 718 (vision/karte-2-stand.json im Zweig `punkte-maschine`,
Kopf 471c911f; die Sprossen bucht der Koordinator).

**Geschnitten:** EINE Regel-Grammatik im Kern beim Tages-Gesetz (koerper-core.js `SPIEL_GESETZ` :5744 bis `spielGeschehen` :6083):
Teilnehmer (Klasse aus Geschlecht, Alter, im Zweikampf Gewicht) · Feld · Zug oder Lauf · Maß · Sieger; daraus Lauf (Zeit über die
Länge des Felds), Zweikampf Ringen (Angriff offen oder mit Finte, Abwehr; je Zug Bradley-Terry, bis 3 Treffer) und Brett (Fünf in
einer Reihe auf 9 × 9). Die Leistung ist der Leib (Sprint aus der Kraft der Beine über das Gang-Gesetz, `leibSprintHoch` — dieselbe
Rechnung wie `leibVerben`; im Zweikampf Φ) × Übung^0,45 (der Lebenslauf: Kunst `kampf`, neu `brett` ab 7 J) × Tagesform — kein
zweiter Stärke-Wert. Das Programm des Abends (`spielProgramm`, 18–21 Uhr) ist f(Same des Platzes, Tag, Gäste des Treffs); der Akt
steht im Tages-Gesetz wie mahl und treff (`tagesPlan` liest `orte.spiel`, Akte wettkampf · brett · zuschauen). Das Feld ist der Platz
des Ort-Plans des Fachwerk-Kerns (`plan.platz`, lange Achse, Ring der Zuschauer im Rechteck, Stücke des Platzes frei). Der Stamm
verdrahtet nur (stamm/siedlung-bewohner.js `_spielTag`, `_spielProgramm`): Stände aus den Auftritten, der Läufer im Tempo seiner
Leistung (`_bewohnerZiel`), der Kopf des nahen Zuschauers folgt `S.spielJetzt` (`_bewohnerKopf`), der ferne wendet den Leib
(`BEWOHNER.fernBlickRad`). Linse gate:koerper-kern TEIL E (E0–E5) mit fünf Tätern, am main c9da3a64 ROT an E0.

**Gemessen (node, die Linse am Kern; der Wirt an einer Stub-Siedlung; die Station am Kopf nur über die GPU-Probe):**

| Sprosse | vorher (main c9da3a64) | nachher (Kopf) | wo |
|---|---|---|---|
| regeln#1 ρ Rangfolge ↔ Leib (Soll 0,6–0,9, 20 Läufe) | Leser fehlt (Genesis, 0 Bewohner) | ρ 0,887 über 20 Läufe, 80 Läufer | gate:koerper-kern E1 (150 Gäste, 40 × 8 m) |
| mannschaft#1 Siegquote des Stärkeren (Soll 0,6–0,8) | Leser fehlt | 0,755 über 200 Gänge | E2 |
| arena#1 Blick folgt dem Geschehen (Soll ≥ 0,8, ≥ 10 Zuschauer) | Leser fehlt (Arena = Fläche) | bis 112 im Ring, 1,000 von 151 157 Proben, seitab 1,000 von 25 441 | E4 (Kopf-Modell) |
| geistspiel#1 regelwidrige Züge (Soll ≤ 0, 100 Partien) | Leser fehlt | 0 in 100 Partien, 5 024 Züge | E3 (eigene Regelprüfung) |

Der Wirt an einer Stub-Siedlung (200 Gäste, Platz 34 × 22 m, Feld 25 × 10 m): Programm 8 ms, 99 Gäste mit Stand, 3 Läufe · 4 Gänge
· 4 Tische; die Seite SPIEL der Station dort: 20 Läufe ρ 0,685 · 160 Gänge Stärkerer 0,769 · 100 Partien 0 regelwidrig (Blick dort
ohne Takt nicht gemessen). Byte: `tagesPlan` ohne `orte.spiel` 1 267 200 von 1 267 200 gleich main, `leibVerben` gleich,
gate:daten-contract GRÜN, sha256 koerper-core 817c809818cf → c8a56e3c067c. gate:mensch-zuege GRÜN, stamm-umzug --nach-karte
0 Abweichungen, diag-atlas --check OK, stamm:lint EXIT 0, format:check GRÜN, lint 0 Fehler.

**Stationen:** Zweig `pm-sport-regeln` (vom Kopf 471c911f des Zweigs `punkte-maschine`, Commit 3581c6ac): Schritt 1 der vier
Leitern liest die Seite SPIEL an stadt-voll um 18,55 Uhr (meisterkarte-quelle/punkte/stationen/k2-mensch-sport.js im Zweig
`punkte-maschine`); Soll, Maß und Richter-Text unverändert, nicht gemergt.

**Ehrlich offen:**
- Der Messort: die Stationen regeln#1, mannschaft#1 und arena#1 maßen am Genesis-Ort, dort wohnt niemand (Dorf-Zug ruht) — Schritt
  1 misst jetzt an stadt-voll; der Entscheid ist des Koordinators.
- Der Wurf fällt aus der Grammatik: der Kern trägt kein Wurf-Gesetz des Leibs (offen bei mensch.sport.regeln, Leser fehlt).
- Die Brett-Hand, Gerät und Sitzen sind nicht sichtbar (die Spieler stehen am Tisch-Stand); der Ringer steht, ohne Griff-Pose.
- Die Sprint-Formel überschießt am Rand der Bevölkerung (bis 12,6 m/s bei kraft 1,8) — koerper `leibSprintHoch`.
- Der Lauf über 25 m dauert 3–4 s; der Blick folgt ihm nur in diesem Fenster, sonst der Linie des Starts.
- Angenommen ohne Quelle: uebungExp 0,45 (Erblichkeit 0,5–0,7), Finte 0,3/0,5/1,5, Zug 4 s und 8 s, Pause 15 s, Programm 18–21 Uhr,
  minGaeste 8, Feld randM 3 · ringM 1,5 · Abstand 0,9 · minLaenge 16 · Breite ≤ 10, Bahn 1,2 m, Abstand der Ringer 1,2 m, Klassen
  15/25/41 J und Gewichts-Drittel, brett ab 7 J, fernBlickRad 15°.
- Das Bild: bild:stadt-voll@0.773 (18,55 Uhr) — das Feld trägt nur zwischen 18 und 21 Uhr ein Spiel, @0.5 zeigt es nicht.
