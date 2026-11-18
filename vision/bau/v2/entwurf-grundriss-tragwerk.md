# ENTWURF A v2 — Grundriss vor Tragwerk (BAU-ZENSUS Runde 2, main b7ed8419, nur gelesen)

Gelesen: entscheid.md §0 ganz, entwurf-stoff-statik.md ganz, pruefung-spike.md ganz, pruefung-quelle.md F4–F9, spike/gesetz-proto.cjs ganz,
die Runde-1-Zählung haus-p.cjs (`konflikte`). An der Quelle: FC = n1011-hg/fachwerk-core.js (SHA-256 028CC2D0…, byte-gleich mit der
Runde-1-Kopie, also gelten die Zeilen der Runde 1) :155–261, :360–474, :584–631, :893–932, :1795–1813, :2165–2276.
Prototyp: **GP** = p3/n1811/bau-spike2/grundriss-proto.cjs (sha256 710dac5c…), er lädt **R1P** = bau-spike2/gesetz-proto-r1.cjs (Kopie von
vision/bau/spike/gesetz-proto.cjs, sha256 d59dc3b8…). Lauf: `node grundriss-proto.cjs` → bau-spike2/grundriss-lauf.log + grundriss-lauf.json
(2 470 Häuser, 166 s). Jede Zahl unten steht in grundriss-lauf.log, sofern nicht anders genannt; die gierige Gegenprobe in grundriss-lauf-gierig.log
(`KAP=1 STOFFE=eiche node grundriss-proto.cjs`).

## WAS NICHT HÄLT (zuerst)

1. **29 % der Fälle haben keinen gültigen Grundriss**: 694 von 2 376 (Raster, drei Stoffe), Eiche 211 von 792. Das ist der ehrliche
   Befund, kein Fallback: der Prototyp gibt `{ok:false, grund}` zurück. Die Gründe (Eiche): 156× „das EG-Programm ist tiefer, als
   das Los erlaubt“ (nur Lose 5 × 20 und 6,5 × 14 m; Tiefe ≤ min(11, T − 4)), 28× „Haustür ohne Platz in der Stirn“ (schmales
   Giebelhaus: der Lauf liegt quer in der Diele und sperrt die Stirn), 15× Raum unter 75 % seines Programms, 7× Laden schmaler als
   1,8 m, 4× Treppenloch > L_max. Von den 94 Haushalten der Runde 1 bekommen **26 keinen Grundriss** (13 Haustür, 10 Tiefe, 3 Kammer).
   Je Los (Eiche, gültig/44 je arm/mittel/reich): B 5: 4/8/1 · B 6,5: 30/21/12 · B 7,5: 40/40/29 · ab B 10: 44/44/44. Der Bruch
   liegt also nicht in der Statik, sondern in der Paarung Haushalt ↔ Los: ein reicher Haushalt auf einem 5-m-Los hat kein Haus.
   Das gehört der Bahn LOS (Haushalt sucht Los), nicht diesem Entwurf — aber bis dort ist es offen.
2. **„0 Konflikte“ ist Konstruktion, nicht Glück.** Der Prüfer `pruefe` (GP:460–498) ist getrennt geschrieben (er liest nur Rechtecke
   und Punkte, rechnet η vorwärts), aber er prüft, was der Bau versprochen hat. Die harte Probe dieses Entwurfs sind darum Punkt 1 und
   Punkt 3, nicht die Nullen.
3. **Die Güte ist mittel**: ein Drittel der Räume sind Durchgangsräume (Eiche 1 087 von 3 205; s='x' 309/991, s='z' 778/2 214) —
   es gibt keinen Längsflur mehr, nur die EINE Querzone. 389 Räume (12 %) sind Röhren (Seitenverhältnis > 2,5). Das OG ist zu groß:
   ist/soll des größten Raums Q50 1,13, Q90 2,03 (das EG setzt den Fuß, das OG bekommt, was darüber liegt). Leerfläche 2 639 m².
4. **Der Preis reißt**: 67 ms je Haus (Aufzählung bis 6⁴ Belegungen × 24 Flur-Lagen × 2 Bandzahlen × 3 Treppen-Modi × 2 Steigungen ×
   bis 5 Geschosse), gegen 1,1–11 µs je Rezept heute (pruefung-spike Urteil 16). Gierig ohne Aufzählung: 0,67 ms je Haus, aber nur
   562 statt 581 gültige Eiche-Häuser und 49 statt 68 der Runde-1-Haushalte (grundriss-lauf-gierig.log). Beides ist für DORF (90 Häuser je Plan)
   zu teuer, solange es im Haupt-Faden läuft.
5. **Treppenpfosten**: in 327 von 581 Eiche-Häusern kreuzt das Treppenloch eine Bandgrenze (Modus „wechsel“); der Unterzug endet dort an
   einem Pfosten NEBEN dem Loch (GP:381–394, 454). Das ist kein „Ständer in der Treppe“ (der Prüfer misst Überlappung mit dem Loch:
   0), aber es ist ein sichtbarer Ständer im Gang neben dem Lauf, lichte Restbreite 1,19 m (Gang 1,36 m − Pfosten 0,16, ≥ NORM.flur 1,0).
6. **Die Hoftür fällt** in 70 von 581 Häusern, weil der Lauf vor ihr liegt (Modus „quer“, Loch im hinteren Band). Gezählt, nicht versteckt.
7. **Ungerechnet** (weder hier noch in Runde 1): der Wechselbalken am Loch, die Wandlast einer OG-Bandwand auf einem EG-Hallen-Unterzug,
   Schub und Auflagerpressung, der Kamin durch die Balkenlage, Wind/Aussteifung. Der Knick-Nachweis rechnet den Wandständer 16 × 16
   (FC:179) mit Knicklänge = Geschosshöhe und das Dach als eine Decke (gewählt): 1 Fall > 1 (Nadel, 4 Geschosse, η 1,009).
8. **Die Breite ist nicht reicher als das Los**: W = Los-Breite (gewählt, geschlossene Zeile). Im Raster gibt es 6 Breiten, weil es 6 Lose
   gibt. Ob die Stadt reicher wird (Wort (2) des Koordinators), entscheidet die Bahn LOS; dieser Entwurf liefert, dass Tiefe, Geschosse,
   Bandzahl, Treppenart und Hallen aus Ursachen folgen (Abschnitt 4), nicht dass die Stadt reich ist.

## (1) DIE KETTE — Haushalt → Programm → Grundriss → Tragwerk

**H → Programm.** `haushalt(gewerbe, klasse)` und `raumProgramm(H, baujahr)` der Runde 1 unverändert (R1P:99–113; BAU_GESETZ §1.1
R1P:7–19; GEWERBE S3 R1P:45–57). `programm` (GP:78–86) trennt EG-Räume, OG-Räume, die Kammern (Zahl nK, Fläche) und was nicht im Körper
liegt (Keller, Dach, getrennt — benannt in `aussen`, nicht verbaut). Die Diele des Kaufmanns ist kein Raum, sondern die Querzone selbst.

**Geschosse** (GP:88–100, 105–113): das kleinste st ∈ 1…5, für das ein gültiger Grundriss entsteht. EG = EG-Räume (bei st = 1 alle);
OG-Räume und Kammern gleichmäßig über st − 1 Obergeschosse.

**Treppe als Raum** (GP:71–76): das Norm-Gesetz von FC:361–368 unverändert, Loch = Lauf + 0,22 + 0,30 (FC:389), ab st 3 zwei Spuren
(FC:259). Die Geschosshöhe kommt aus der Epoche (R1P:82, licht 2,0/2,2/2,6 + Balken + Diele): 1250 und 1450 gH 2,27 → Loch 3,64
(Spar 2,94); 1650 gH 2,47 → 4,26 (3,16); 1850 gH 2,87 → 4,70 (3,60) m. **Damit ist die Epoche eine Ursache der Grundrissform**: ab 1850
passt das Norm-Loch in kein Eichen-Band mehr (4,70 + 0,26 > 4,59) — die Häuser von 1850 haben 0 Mal Modus „band“ ohne Spar.

**Ausrichtung** (GP:126–129): ist das Haus bei Los-Breite B breiter als tief (D = A_EG / (B − w_f) ≤ B), laufen die Bänder längs der
Straße (s = z, Balken spannen in die Tiefe, Querflur von Gasse zu Hof — das Ernhaus); sonst laufen sie in die Tiefe (s = x, Balken
spannen über die Breite, Diele vorn über die ganze Breite — das Giebel-/Dielenhaus). Eiche: 389 × s='z', 192 × s='x'.

**Bänder = der ZWANG** (GP:130–141, 199–209): n = ⌈L_s / L_max⌉ (oder n + 1, Kosten entscheiden, G8). Jedes Band b_j ∈ [b_min, L_max];
die Breiten folgen aus den EG-Räumen: s='z': b_j = A_j / Σℓ (die Tiefe D = Σ b_j folgt), s='x': b_j = B · A_j / ΣA (die Breite ist fest).
Ein Band über L_max wird auf L_max gezogen; was der Raum dabei verliert, steht als ist/soll in ihm und entscheidet dort (G4) — kein stilles
Verschlucken. Eiche: n = 1: 7, 2: 318, 3: 238, 4: 18 Häuser.

**Belegung** (GP:142–170, 172–250): jeder EG-Raum geht in ein Feld (Band j × Seite der Querzone) oder als HALLE über alle Bänder einer
Seite (ein Raum je Seite; die Grenze wird dort Unterzug auf Ständern in der Raummitte — die Stubensäule). Aufzählung erschöpfend bis 6⁴
Belegungen, Rest gierig (G11); Kosten = max |ln ist/soll| + 0,3·Röhren + 0,03·Durchgänge + 0,1·(Straßenraum nicht in Band 0) +
0,1·Hallen + 2·Leerfläche/A (G10). Im OG (GP:324–337): Räume nach freier Fläche auf die Seiten; eine Seite mit weniger Räumen als Bändern
legt sie als OG-Halle quer über alle Bänder.

**Treppenloch** (GP:253–290), drei Modi in dieser Reihenfolge, je mit Norm- und Spar-Steigung:
- **band**: das Loch liegt ganz in einem Band mit Abstand klar = 0,13 m zu jeder Grenze; ein Endband braucht zusätzlich das Podest 0,9 im
  Band. Passt keines, wird ein Band auf den Bedarf gezogen (≤ L_max, s='z' die Tiefe wächst, s='x' die anderen teilen den Rest).
- **wechsel**: das Loch kreuzt eine Grenze; der Unterzug ist dort unterbrochen und endet an einem Treppenpfosten NEBEN dem Loch
  (GP:381–394, 454); die Balken über dem Loch sind gewechselt. Braucht L_s ≥ Loch + 2 Podeste, keine Grenze näher als klar an einer
  Lochkante.
- **quer**: das Loch läuft längs u in der tieferen Querzone (w_f = 2·0,9 + Loch + 2·klar), in einem Band.
Die Treppe lehnt an EINER Wand der Querzone (GP:297–315, zwei Seiten werden versucht); Türen in dieser Wand liegen nie hinter dem Lauf.
Eiche: band 152 · band-spar 13 · wechsel 300 · wechsel-spar 27 · quer 79 · quer-spar 10.

**Türen** (GP:344–372): jede Tür ist eine Zwangs-Achse des Ständer-Rasters: ihre Kanten ± post/2 sind Ständer, in ihrer Öffnung steht
keiner (GP:436). Raumtüren in der Flurwand, Lage = die freie Stelle nächst der Bandmitte, gesperrt: Bandgrenzen ± (post/2 + Tür/2)
und die s-Spanne des Laufs an seiner Wand. Räume ohne Flurwand bekommen die Tür in der Querwand zum Vorgänger (Durchgang, gezählt).
Haustür im Gang neben dem Lauf (s='z') bzw. in der Stirn außerhalb der Lauf-Spanne (s='x'); Hoftür nur, wo kein Lauf davor liegt.

**Tragwerk** (GP:373–400, 428–458): Balken spannen s und liegen NUR auf den Linien s = sb_j; jede solche Linie ist auf ganzer Länge
entweder tragende Wand (Band-Wand zwischen zwei Räumen verschiedener Bänder, Außenwand) oder Unterzug (in der Querzone, in einer Halle)
oder Loch (gewechselt). Die Querwände zwischen Räumen eines Bandes laufen parallel zu den Balken und tragen nicht. Unterzug-Felder
≤ L_uz(Einzug = halbe Nachbarbänder) per Teilung; über dem EG stehen freie Ständer nur, wo darunter die Bandwand in der Flucht liegt
oder ein Ständer steht (G9, GP:445–452), sonst ist der Grundriss ungültig. Wandständer: Ecken, Kreuzungen, Raster ≤ 1,7 (FC:181
`bayMax`, als Gefach-Maß belegt, statisch gewählt — entwurf-stoff-statik Punkt 5).

**Herd** (GP:411–426): im Herdraum/der Küche vor einer Wand, Lage gesucht (nicht gewürfelt) außerhalb jedes Türschwungs 0,8 (FC:905),
jedes Ständers und des Lochs; Körper 1,5 × 1,05 (FC:592). Findet sich kein Platz, steht `herdOhnePlatz` (Eiche 0, Stange 17).

## (2) DIE ZAHLEN (grundriss-lauf.log)

| Satz | Fälle | gültig | Balkenlinien über L_max | Unterzug-Felder über L_uz | Auflager-Linie frei | Ständer in Tür | Ständer in Treppe | Unterzug im Loch | Tür auf den Lauf | freier Ständer ohne Lastpfad | η Balken max | η Unterzug max |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Eiche d 0,258 | 792 | 581 | 0 / 2 192 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1,000 | 0,999 |
| Nadel d 0,30 (gewählt) | 792 | 579 | 0 / 1 891 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1,000 | 0,997 |
| Stange d 0,20 (gewählt) | 792 | 522 | 0 / 2 306 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1,000 | 0,995 |
| Runde-1-Haushalte (94, Los b × 30, Eiche) | 94 | 68 | 0 / 270 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1,000 | 0,957 |

Raster = 4 Epochen (1250/1450/1650/1850) × 3 Wohlstand × 11 Gewerbe (GEWERBE R1P:45–57) × 6 Lose (5×20, 6,5×14, 7,5×30, 10×30, 13×25,
16×30) je Stoff. **Gegen Runde 1 an denselben 94 Haushalten:** dort traf die Ständerreihe Treppe oder Tür in 52 von 94 (55 %, günstigste
Lage, pruefung-spike Urteil 8); hier 0 von 68 gültigen — und 26 der 94 haben keinen Grundriss (Punkt 1 oben). Stopp-Schwellen des
Koordinators: 0 von 100 Balkenlinien über L_max — gehalten (0 von 6 389 im Raster); Ständer trifft Tür/Treppe ≤ 10 % — gehalten (0 %),
unter der Definition „Überlappung mit Türöffnung bzw. Loch“; Treppenpfosten neben dem Loch: 992 Häuser von 1 682 (alle Stoffe).

Der Stoff des Orts wirkt: L_max 4,59 (Eiche) · 5,62 (Nadel 0,30) · 3,27 m (Stange 0,20); Stange baut 3–5 Bänder (z·3B·wechsel·Halle 128
Häuser), Nadel meist 2 (z·2B·band 110), und Stange verliert an den Losen 7,5 und 10 m (20/35/17 und 37/38/33 gegen 40/40/29 und 44/44/44).

## (3) STATIK NACHGEPRÜFT (entwurf-stoff-statik §1.1/§2, Selbsttest GP:534–550, GRÜN 8/8)

- Kreuzholz d 0,258 → 0,149 × 0,2107 (R1P:72) — gleich Runde 1.
- L_max Eiche, e 0,85: **4,593 m**; der Vorwärts-Nachweis `eta` (GP:59–64, Durchbiegung inst g+q l/300, fin mit k_def 0,6 / ψ₂ 0,3
  l/250, Biegung k_mod 0,8 / γ_M 1,3 / γ_G 1,35 / γ_Q 1,5) trifft an L_max genau η = 1 — die Umkehrung `balkenSpann` (R1P:74–80) stimmt.
- Balken 15 × 21 bei e 1,7: 3,643 m (Runde-1-Selbsttest B1) — gleich.
- Heute G29#35 (15 × 21, e 1,31, L 7,46): η 6,57 = w_fin 197 / l/250 30 mm (pruefung-spike (2)) — gleich; maßgebend ist w_fin, nicht w_inst.
- **Korrektur an Runde 1:** „Unterzug 0,149 × 0,211 trägt bis 2,64 m bei Einzug 4,17“ (pruefung-spike Urteil 7) ist die Stelle η_fin 0,93;
  die Grenze η = 1 liegt bei **2,70 m** (GP Selbsttest Punkt 5, `T.Luz(4.17)` = 2,703).
- Die Wahlen bleiben, wie Runde 1 sie markierte: E₀,mean 11 000 MPa für D30 (EN 338:2016, unsicher — :2009 nannte 10 000), Grenzen
  l/300 und l/250 am MILDEN Ende von EN 1995-1-1 Tab. 7.2 (gewählt), w_inst aus g + q statt q (strenger, gewählt), C24-Knickwerte auch
  für Eiche (sicher-seitig, unsicher).

## (4) URSACHEN DER FORM (jede Differenz zweier Häuser hat einen Namen)

Am Prototyp unterscheiden sich zwei Häuser nur durch: das Los (B → Ausrichtung, W; T → Tiefen-Grenze), den Haushalt (Gewerbe, Wohlstand
→ EG-Fläche → D und Bandbreiten; Gesinde/Köpfe → Kammern → st), die Epoche (Stube ab 1300, Küche ab 1700, R1P:106–108; lichte Höhe →
Lauf → Treppen-Modus), den Stoff (d → L_max → n Bänder → Hallen, Unterzug-Felder). Es gibt keinen Würfel im Grundriss: der Seed-Versatz
des Schachts (FC:369–370) und die Gewichts-Würfel des Raumprogramms (FC:598–605) haben im Entwurf keinen Nachfolger. Formen W × D × st:
332 bei 581 Eiche-Häusern; 38 Typen (Ausrichtung · Bänder · Treppe · Halle), häufigster z·3B·band 101 (17 %). Ein Stadtmaß (Formen je
Stadt, häufigste Form, Breiten-Stufen gegen 440 / 6 % / 21) lässt sich am Raster NICHT messen — das Raster ist kein Plan.

## (5) SIGNATUREN IN fachwerk-core.js UND WAS DORT FÄLLT

```
treppeVon(gH, st, spar)                         → {N, rise, go, run, loch, breite, spuren}      FC:361–368 umgezogen, Loch FC:389
grundrissVon(haushalt, baujahr, los{B,T}, ort)  → {ok:true, s, Lu, Ls, W, D, st, n, b[], sb[], wf, p, treppe{modus,u0,u1,s0,s1,laengs},
                                                    geschosse[{raeume[], tueren[], waende[], unterzuege[], staender[]}], herd, felder[]}
                                                 | {ok:false, grund}        wirft ohne haushalt, los.B, los.T, baujahr oder ort
tragwerkVon(grundriss, ort)                     → {Lmax, felder[{band, spann, e, eta}], unterzuege[{s,u0,u1,feld,eta}], staender[{u,s,art}]}
pruefeGrundriss(R)                              → die Zählung von GP:460–498 als Linse (gate), nicht im Bau
```
`ort` ist {holz, d} am Anker (Entwurf A Runde 1 §1.2 `holzDesOrts`, `stammD`); ohne ihn wirft `ortTragwerk` (GP:50–52, Selbsttest Punkt 8)
— kein `?? Heimat` (F9). Wie `ort` durch den Worker-Kanal reist, entscheidet die Bahn ORT, nicht dieser Entwurf.

Was fällt (Absenz-Grep der Bahn: `fw\b|shaftCX|shaftRange|bxFront|isAxis|prog\(|_chS|hearthSX|layJoists` außerhalb grundrissVon = 0):
- FC:257–261 `stW, mainW, loftW, shaftHalf, fw` — die Flur-Halbbreite aus W·0,15 (der geerbte Längsflur, Wurzel des 52/94).
- FC:369–371 `shaftRange, shaftCX` — der Seed-Versatz der Treppe; FC:385–389 `stZ0, STAIR` → treppe des Grundrisses.
- FC:418–424 `axis, bx, bxFront, bz` — das Ständer-Raster aus bayMax mit ±fw → `staender` je Wand.
- FC:451–457 `postsRing, plateRing` lesen bx/bz → lesen die Außenwand-Ständer des Tragwerks.
- FC:466–470 `layJoists` (Balken auf JEDEM Ständer, Spannweite = volle Tiefe) → Balkenfelder je Band, e 0,85, Spann b_j.
- FC:585–630 Innenraum: `_ch/_chS` (586), Herd-Lage (588–597), `prog` (601–605), `layout` (606–618), Funktionen (623–630) → raeume.
- FC:897–917 `innenwaende`: Flurwand bei ±fw, Querwände an bz → waende/tueren des Grundrisses; FC:919–932 `herd()` liest herd.
- FC:556 Balkontür liest `2*fw` → liest die Querzone.
- FC:2245–2276 `bauProgramm`: capK/capL/F0, Wn = √(F·r), hp.W/hp.D/hp.storeys (2271–2272) → W = los.B, D/st aus dem Grundriss.
- FC:1807–1812 `dims.fw, rooms, stairX0…, flights` werden aus dem Grundriss gefüllt (Grep `dims\.(fw|rooms|stair|flights|loft)` in
  stamm/vegetation-baum.js und worlds/fachwerk/fachwerk.js: 0 Treffer; andere Leser über andere Namen ungeprüft — unsicher).
Bleiben: NORM FC:254, post/doorW/bayMax FC:179/181 (als Maße des Gesetzes), der Treppen-Bau `treppe()` FC:933 ff. (liest flights).

**Byte-Vertrag:** jedes Wohnhaus mit Haushalt ändert Grundriss, Ständer und Balken — eine benannte Wandlung. Der Würfel `_bauweiseWurf`
(FC:2203–2216) zieht für Häuser mit Haushalt nur noch pitch; W/D/st kommen aus Los und Grundriss.

## (6) DIE BAHN „GRUNDRISS-TRAGWERK“ — ausschließlicher Besitz (Vorschlag, Wort (3))

Besitzt in FC: :253–261, :360–424, :451–474, :585–630 (inklusive Herd-Lage — F8 bekommt hier EINEN Besitzer), :897–932, :2245–2276, die
neuen Funktionen oben. Besitzt NICHT: `wallSpec` FC:476–497 (Fenster, Bahn ÖFFNUNGEN) — Schnittstelle: ÖFFNUNGEN liest `staender` je
Außenwand und setzt Fenster nur zwischen zwei Ständer; FC:478 `isAxis(±fw)` fällt dort, weil fw fällt (die einzige Stelle, an der beide
Bahnen dieselbe Zeile berühren — Reihenfolge: GRUNDRISS zuerst, ÖFFNUNGEN liest dann `staender`). DORF FC:4403 ff. (Bahn LOS) reicht
`los{B,T}` und `ort`; die Kopplung Haushalt ↔ Los (Punkt 1 oben) gehört LOS.

## (7) SCHLIESSUNGEN UND ANNAHMEN

| # | Wert | Quelle | Status |
|---|---|---|---|
| S1 | Balkenabstand e 0,85 m | Runde 1 (Sparrenteilung FC:778) | gewählt |
| S2 | Stamm d Eiche 0,258 m; Nadel 0,30 und Stange 0,20 nur als Probe des Zwangs | Runde 1; die zwei anderen ohne Quelle | gewählt / unsicher |
| S3 | GEWERBE 7 von 11 Zeilen, Gesinde | R1P:45–57 | unsicher (Runde 1) |
| S4 | größte Haustiefe dZiel 11 m | Runde 1 (Bs dMax) | gewählt |
| S5 | Kammern arm 1, sonst ⌈Köpfe/2⌉ | R1P:38 | gewählt |
| S6 | Klasse als Rang | R1P:40 | gewählt (hier als Eingang, nicht gezogen) |
| — | NORM flur 1,0 · treppe 0,9 · Steigung 0,19/0,21 · Schritt 0,62 · Podest 0,9 | FC:254 (SIA 500 / DIN 18065) | belegt |
| — | Loch = Lauf − 0,22 … + 0,30 | FC:389 | belegt (Spiel) |
| — | post 0,16 · Haustür 1,1 · Innentür 1,0 · Türschwung 0,8 · Herd 1,5 × 1,05 | FC:179, 181, 897, 905, 592 | belegt (Spiel) |
| — | Ständer-Raster ≤ 1,7 m | FC:181 bayMax | belegt als Gefach-Maß, statisch gewählt |
| G1 | lichter Abstand Loch/Tür ↔ Ständer-Achse 0,13 (post/2 + 0,05) | — | gewählt |
| G2 | schmalstes Band 2,0 m | — | gewählt |
| G3 | kleinste Raum-Abmessung 1,8 m | Runde-1-Klasse „Raum < 1,8“ | gewählt |
| G4 | Raum ≥ 75 % seines Programms, sonst ungültig | — | gewählt |
| G5 | Röhre ab Seitenverhältnis 2,5 (Kosten, kein Verbot) | — | gewählt |
| G6 | Hof ≥ 4 m hinter dem Haus | — | gewählt |
| G7 | höchstens 5 Geschosse | — | gewählt |
| G8 | n oder n + 1 Bänder | — | gewählt |
| G9 | freie Ständer über dem EG nur über Bandwand oder Ständer | Lastpfad | gewählt (Regel), physikalisch belegt |
| G10 | Kosten-Gewichte der Belegung | — | gewählt |
| G11 | erschöpfend bis 6⁴ Belegungen, Rest gierig | — | gewählt |
| G12 | W = Los-Breite (geschlossene Zeile) | — | gewählt |
| G13 | Unterzug aus demselben Stamm wie der Balken, Last gleichmäßig verteilt | — | gewählt (sicher-seitig in der Form, unsicher im Wert) |
| G14 | OG-Querzone bleibt Flur über allen Bändern | — | gewählt (verschenkt Fläche, Punkt 3) |
| G15 | Hoftür entfällt, wenn der Lauf davor liegt | — | gewählt (gezählt: 70) |

## ERSTE PUNKTE DER NÄCHSTEN RUNDE

1. **Haushalt sucht Los** (Bahn LOS): die 156 „Tiefe“-Fälle sind reiche Haushalte auf 5–6,5-m-Losen; die Verteilung Wohlstand → Los-Breite
   aus einer belegten Parzellen-Quelle, dann die Ausfall-Quote neu zählen.
2. **Preis**: Aufzählung im Bau-Worker mit Platten-Cache je Schlüssel (Programm, B, T, Epoche, Stoff), oder die gierige Belegung verbessern
   (heute 562 statt 581) — Ziel ≤ 50 µs je Haus warm, gemessen in DORF, kalt und warm im selben Prozess.
3. **Längsflur als dritte Form** für tiefe Häuser mit vielen Räumen (Durchgangsräume heute 34 %): ein Flur in einem Band, seine Wände sind
   Bandwände — er würde den Längsflur aus dem Programm zurückholen statt aus W·0,15.
4. **OG aus dem eigenen Programm**: Kammerzahl aus der verfügbaren Fläche (ist/soll Q90 2,03 heute), Querzone im OG nur als Treppen-Vorplatz.
5. **Nachweise**: Wechselbalken, Wand auf Unterzug, Schub; Knick mit dem Ständer aus vierkant(d).
6. **Bild**: kein einziges Haus dieses Entwurfs ist gebaut oder gesehen — Gasse nah mit Diele/Querflur, Unterzug und Treppenpfosten am
   main-Kopf, bevor eine Welle startet.
