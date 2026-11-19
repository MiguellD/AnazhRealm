# DAS GESETZ DES VERKEHRS — Verkehr FOLGT aus der Stadt (EIN Gesetz, vor dem Spike)

Grund: der Zensus (`zensus.md`). Die Stadt ist eine Funktion von Kacheln (`kachelNetz`, `viertelWort`), der Tag eine Funktion
von (Person, Uhr) (`tagesPlan`), der Wagen ein reiner Fahr-Schritt (`fahrSchritt`). Was fehlt, ist das Gesetz, das diese drei
zu einer Fahrt verbindet, ohne die Stadt als Sack zu halten. Der Maßstab ist die Megastadt (10⁶ Haushalte, 10⁷ Fahrzeuge in
der Vision): die Kosten hängen am Schirm und an der Änderung, nie an der Zahl der Wagen.

## Das Gesetz in fünf Sätzen

1. **Jeder Haushalt ist eine Adresse der Stadt-Funktion und hat Personen mit einem Tag:** Haushalt = (Same, nH, Kachel o,
   Index h < H_o) mit H_o = `viertelWort(o).nH`; er wohnt im Haus h mod n_o der Kachel (`kachelMassen`), sein Wagen gehört
   ihm (die ersten C_o = ⌊μ · H_o⌉ der Hash-Reihe π_o sind motorisiert, der Typ folgt aus seinem Samen), am Steuer sitzt seine
   Person 0, und ihr Werk beginnt nach dem Tag des Menschen (`TAGES_GESETZ.werk` [8, 17] ± `streuH`, koerper-core).
2. **Eine Fahrt ist (Person, Uhrzeit) → Ziel → Route → Lage(t):** das Ziel ist eine Werk-Kachel d nach dem Gravitations-Gesetz
   (w_od = J_d / (1 + (|od|/ℓ)²) über die Kacheln im Radius R_max, J_d = H_d · `erbe.hoch` — Arbeit folgt der Geschossfläche;
   die Zuteilung n_od nach größten Resten, kein Würfel), die r-te Person des Paares beginnt um
   W = werk₀ − streu + 2·streu·(r + φ_od)/n_od, die Route ist Tür → Gasse → Tor der Heim-Kachel in Fahrtrichtung →
   Hauptstraße der Heim-Reihe → Ecke an Knoten 0 der Eck-Kachel → Hauptstraße der Werk-Spalte → Tor der Werk-Kachel → Gasse →
   Tür (abends dieselbe Linie zurück), und die Lage ist der Weg s(t) auf dieser Route. Die Hauptstraße einer Route ist EINE
   Linie von Tor zu Tor samt Ecke, die Tore sind feste Punkte, jeder Knick ≥ 2° ist ein Bogen, dessen innere Spur R = 6 m fährt;
   ihr freies Tempo-Profil gilt für jeden Wagen des Paares. Anfang und Ende gehören der Gasse des Haushalts: der Anlauf bis
   dorthin, wo ein Wagen aus dem Stand am Tor das freie Profil eingeholt hat, der Auslauf ab dort, von wo er bis zum Stand am
   Tor bremsen kann — an diesen Stößen stimmen Ort, Richtung und Tempo überein (gezählt, nie geglättet).
3. **Der Zustand der Stadt wird nie gehalten — der Schirm fragt die Funktion:** „welche Wagen sind JETZT auf DIESER Kante“ ist die
   Umkehrung von Satz 2 — eine Gasse trägt nur Fahrten ihrer Kachel, die Hauptstraße einer Reihe nur die der Heime dieser
   Reihe, die einer Spalte nur die der Werke dieser Spalte; je Paar (o, d) gibt die Umkehrung von W die Ränge r in O(1), und
   nur sie werden ausgewertet.
4. **Nah fährt der Wagen in der echten Fahr-Physik, fern ist er eine Lage auf der Kante:** nah setzt die Lage (Ort, Tangente,
   v, Krümmung) den Zustand des Fahr-Schritts (vc `fahrZustand` + `fahrSchritt`), Person 0 sitzt als Leib am Steuer und ihr
   Fahrer folgt s(t); beim Wechsel zurück bleibt nur der Rest Δs, der mit ≤ 1 m/s verklingt — weder Ort noch Tempo springen.
5. **Vorfahrt, Abstand und Stau folgen aus EINER Regel je Kante:** dem Fundamentaldiagramm (Dreieck aus v_f, q_max, ρ_jam) über
   die Summenkurven der Kante (Newell): der k-te Wagen (k = Zufluss A(t_ein)) verlässt sie, wenn der Abfluss D ≤ q_max ihn
   erreicht; unter der Kapazität ist das die freie Fahrt selbst, darüber wächst der Rückstau mit der Welle
   w = q_max / (ρ_jam − q_max / v_f) stromauf — nie suchen Wagen einander.

## Die Größen

| Größe | Wert | folgt/gesetzt | Quelle |
|---|---|---|---|
| Stadt | (Same, nH) | gesetzt (das Wort) | fwc `stadtPlan`, `viertelWort` |
| Haushalte je Kachel H_o | `viertelWort(o).nH` | folgt | fwc:4006 |
| Haus, Tür | Haus h mod n_o; Tür = Straßenpunkt nächst dem Haus | folgt | fwc `kachelMassen` :4074 |
| Motorisierung μ | 0,5 | gesetzt (Gesetz-Parameter) | — |
| Arbeitsplätze J_d | H_d · `erbe.hoch` | folgt | fwc:4006 (`erbe.hoch`) |
| Reichweite ℓ / Radius R_max | 1 000 m / 8 Kacheln (2 048 m) | gesetzt | — |
| Werk-Beginn, Dauer | `TAGES_GESETZ.werk` [8, 17], `streuH` 0,5 | folgt | kc:5126–5219 |
| Phase φ_od | Hash(o, d) ∈ [0, 1) | folgt | `netzHash` |
| Route | Gasse → Tor → Hauptstraße der Reihe → Ecke → der Spalte → Tor → Gasse | folgt aus dem Netz | fwc `kachelNetz` (Tore, Knoten 0, gen 0) |
| Bogen, Kurve | innere Spur R = 6 m; a_quer 2,5 m/s² → 3,87 m/s; an/ab 1,5 / 2,0 m/s² | gesetzt | — |
| v_f | 13,9 m/s (gen 0), 8,3 m/s (gen 1) | gesetzt | — |
| ρ_jam | 1 / (Länge der Hülle + 2,5 m) ≈ 1 / 7 m | folgt aus der Hülle | vc `huelle` :3467 |
| q_max | 0,5 Fz/s je Spur (Zeitlücke 2 s) | gesetzt | — |
| Stauwelle w | q_max / (ρ_jam − q_max / v_f) ≈ 4,7 m/s (17 km/h) | folgt | Vision `netz.verkehr` S4: 15–20 km/h |

## Die wenigen Daten, die bleiben

1. Das Wort der Stadt (Same, nH) und die Gesetz-Parameter oben — zwei Zahlen und eine Zeile.
2. Am Schirm, verwerfbar: die Kachel-Netze und -Häuser im Sichtkreis, die Ziel-Tafeln (n_od, Reihe π_o) der Heim-Kacheln im
   Fenster R_max um ihn — begrenzt durch R_max, nie durch die Stadt.
3. Die Summenkurven der Kanten, deren Zufluss q_max übersteigt (die Engstellen) — dünn: nur gestaute Stücke und Stunden.
4. Der Rest Δs der Wagen, die nah waren, bis er verklungen ist.

Nie: eine Liste aller Wagen, ein Takt über alle Wagen, eine Suche von Wagen nach Wagen.

## Je heutiger Attrappe: FOLGT oder FÄLLT

| heute | datei:zeile | Urteil unter dem Gesetz |
|---|---|---|
| Wagenzahl `verkehrVon` (`hausJeWagen` 15) | fwc:4867–4879 | FÄLLT als Zahl, FOLGT als Haushalt (μ · H_o, Satz 1) — fwc ist fremde Bahn: der Schnitt dort ist ein Diff, kein Commit dieser Sitzung |
| gehaltene Liste `S.verkehr.wagen`, `_verkehrAnlegen` | sv:27–441 | FÄLLT (Satz 3) |
| `_tickVerkehr`, `_verkehrSchritt` mit Belegung, Leiter, Kappe | sv:749, 1425, 1560 | FÄLLT — nah bleibt nur `_wagenSchritt` je Wagen am Schirm |
| `_verkehrFolge`, `_verkehrUmfahren`, `_verkehrZonen`, `_verkehrReihe`, `_verkehrKreis` | sv:1576, 1828, 1886, 2343, 2357 | FÄLLT (Satz 5) |
| `_verkehrVorrang` | sv:533 | FÄLLT — der Fußgänger fragt die Kante, nicht jeden Wagen |
| `_verkehrAnkunft`, `_verkehrSprung` | sv:882, 1041 | FÄLLT — die Lage ist f(t), ein Uhrsprung ist eine neue Frage |
| `_verkehrZielNeu`, `_verkehrHeim`, `_verkehrParken` (Zufalls-Wende) | sv:938–1004 | FÄLLT (Satz 2: Ziel mit Anlass) |
| `_verkehrImRaster` | sv:2119 | FOLGT nur für die Wagen am Schirm (Satz 3) |
| Route im Plan-Netz (`_verkehrZuege`, `_verkehrWegZu`) | sv:1095–1258 | FÄLLT für die Stadt — die Route folgt dem Kachel-Netz; das Plan-Netz bleibt Geometrie des Dorfs |
| Spur-Fragen, Trassen-Boden | sv:454–492, 2047–2102 | FOLGT (Geometrie) |
| Stellen, Bild, Sitz, Einsteigen | sv:619–719, 811, 853 | FOLGT als Leser der Lage |
| `_wagenSchritt` (vc `fahrKraefte`) | kf:1575 | FOLGT (Satz 4) |
| Stamm-Fahrer `_fahrerLinie`, `_fahrerSchritt` | kf:1873, 1954 | FÄLLT für den Verkehr — der Fahrer folgt s(t) |
| Rennstrecke, Spielerwagen | gelaende-core.js:200; kf:1629 | FOLGT (unberührt) |

Ob das trägt, sagt der Spike (`spike.md`): er versucht es an den Kosten (a), der Erhaltung (b), dem Wechsel nah ↔ fern (c),
dem Stau (d) und dem Determinismus (e) zu widerlegen. Fällt (a) oder (b), endet die Sitzung mit dem Befund.

**Stand nach dem Spike (19.11.):** (b) widerlegt Satz 2 an der Gasse — die Route „Tür → Gasse → Tor“ fährt auf Straßen unter
`VERKEHR_GESETZ.breiteM`, die der Kern ohne Wagen führt (`wegArt`, fwc:10109), und die Fahrstraße der Kachel-Stadt hat keinen
Stellplatz. Spur, Bogen und Platz dieser Fassung (eckR 6, Gassen-Spur w/4, parkM 2,15) sind eigene Zahlen statt
`VERKEHR_GESETZ` (spurM, kurveR, parkB). Befund und der kleinste Schnitt im Kern: `spike.md`.
