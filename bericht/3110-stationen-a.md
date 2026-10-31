# 3110 stationen-a — 18 Kriterien ohne Station: Spike am main 94c079cb

Cloud-Sitzung, CPU. Gemessen im Spiel-Baum am main 94c079cb mit dem vorhandenen Werkzeug: Code gelesen (Absenz-Grep
im Stamm und in den Kernen) und, wo das Spiel die Größe trägt, an der Prüfbühne auf swiftshader (`werkbank start`,
`umstellen --ort buehne`: 74 s, kienspan — ohne Kaskaden) über `werkbank eval`. Die Fahrt je Karte stand vorher bei
Radeon 1 775 / GTX 1 770 von 1 800 s; diese Abgabe legt keine Probe in die Sitzung.

## Spike-Tafel

| Kriterium | Spike | Zahl / was fehlt |
|---|---|---|
| wetter.K4 | unmessbar ohne neues Spiel | Schnee ist Boden-Farbe (gelaende-core `schnee`, Grenze am Pegel `schneeVersatz`); kein Leser der Schnee-Tiefe am Fuß (0 Treffer einsinken/Spur/Tiefe) — die Tiefe ist schon für 1 Pflicht |
| physik.K4 | unmessbar ohne neues Spiel | kein Seil-/Tuch-/Weich-Löser in Stamm und Kernen (`stepRope` nur worlds/schmiede); Brunnen-Seil starr, Rolle `segel` ein Sinus im Wind |
| physik.K5 | unmessbar ohne neues Spiel | kein aktiver Leib: Spieler = Kapsel, das Impuls-Gesetz (`STOSS`, `_freiStoss`) stößt nur freie Körper, Wagen, Kreaturen; 0 Treffer Gleichgewicht/Stolpern/Ragdoll |
| stoffe.K4 | unmessbar ohne neues Spiel | kein Alter im Stoff: `verwitterung` ist Regler (0…1), Fels-Moos liest `_feuchteAt` ohne Zeit; was in 30 Tagen wandert (Schneegrenze, Pegel-Ufer), ist Stoffe K3 |
| vegetation.K3 | unmessbar (REF) | das Band der REF real-mischwald (Stämme je Bildbreite, Unterholz 0–2 m) fehlt; die Soll-Tafel trägt von ihr nur kante 0,160 (fehlt-Einträge standen schon) |
| haar.K3 | unmessbar ohne neues Spiel | Haar und Fell starr: Schalen und Strähnen ohne Wind-Term; der EINE Wind bewegt am Leib nur die Rolle `segel` |
| **haar.K4** | **GRÜN — Station gebaut** | 1320 mittelalter poncho/pants/boot gegen 1935 moderne tshirt/pants/sneaker: 63,1 % der Leib-Pixel anders, Schnitt allein 16,2 %, Umriss-Deckung 0,96, Mutante 0 %, Treue 0 Bytes |
| haar.K5 | ROT | feste Herde 8 Wölfe 4–60 m, `__drawZensus`: tier:wolf 29 + tier-satz 3 = 32 Befehle im Hauptbild > 30, ohne Wurf (kienspan zeichnet keine Kaskaden) |
| luftwasser.K3 | unmessbar ohne neues Spiel | es gibt keine Fische (0 Treffer) |
| luftwasser.K4 | unmessbar ohne neues Spiel | es gibt keine Insekten/Bestäuber (0 Treffer) |
| licht.K4 | unmessbar ohne neues Spiel | die Wolke wirft nichts: 2D-FBM-Himmel, kein Leser eines Wolken-Schattens am Boden |
| ferne.K3 | unmessbar ohne neues Spiel | jenseits `FERN_KRONE_NAH` 384 m ist der Wald Farbe (`aKrone`), der Fern-Ring trägt kein Relief |
| ferne.K4 | unmessbar ohne neues Spiel | jenseits der Kaskaden (180–306 m) kein Schatten-Term, kein Leser eines Horizont-Winkels |
| schatten.K2 | ungemessen (Linse fehlt) | keine Linse trennt den Schattenrand; Anhalt GTX e0139769 lod.K2#1: 0,8–1,6 % des Bilds ändern sich je 0,5-m-Schritt bei stehender Kamera (alle Ursachen) |
| schatten.K3 | ROT | Pfosten 0,5 × 0,5 × 3 m an der Bühne, Band 2–18 cm (Kamera-Seite, 110 Punkte): mit Pfosten 0,1099 = ohne 0,1099, gegen freien Boden 0,978 (Soll 30–60 %) — keine Verdeckung zwischen den Dingen (`aoNode` nur Gelände-Himmels-Sicht + Kavität, ssao/gtao 0 Treffer) |
| schatten.K4 | ROT | weiße Wand im Eigenschatten (N·L −0,27): Luma 0,0634 neben der Wiese = 0,0634 mit schwarzer Platte 30 × 30 m (Boden-Albedo 0) → Gewinn 0 % (Soll ≥ 10 %) — die Rückstrahlung ist die feste Welt-Albedo `ATMO_BODEN` der Umgebung, nie der Boden am Ort |
| schatten.K5 | unmessbar ohne neues Spiel | das Feuer wirft nichts: LICHT_GESETZ ist ein Uniform-Pool im Stoff, kein Licht-Objekt, die Kaskaden kennen nur das Richtlicht |
| lod.K4 | ROT | kanten.js (lod.K5#1) mit dem Luma-Mittel je Maske, L0 gegen Stufe am Wechsel-Abstand, Treue 0 Bytes: Baum L1 −6,0 %, L2 −7,2 %, Haus L1 −2,4 % (Soll < 2 %); Haus L2, Tor, Wagen ohne gültige Maske an der Bühne; zweiton ungemessen (kanten.js schießt ohne Blende) — 19 min auf swiftshader |

## Neue Station

- **haar.K4#1** (headless, `stationen/g2.js`: `trachtSzene` · `trachtLauf` · `trachtUrteil`, 7 Proben): eigene Werkbank
  (swiftshader), Fenster 960 × 540, Prüfbühne; zwei Pläne der Saat 7 aus dem Export des Fachwerk-Kerns (1320, 1935), je Plan
  die erste Gestalt (`_bewohnerGestalten`) als Leib des EINEN Mensch-Baus, je Leib ein Schuss aus dem Ausgabe-Pfad an derselben
  Pose; Mutanten: 1935 mit der Tracht von 1320 (muss gleichen) und der Schnitt von 1935 in den Farben von 1320 (muss allein
  ≥ 5 % ändern). Über die Maschine gefahren (`run --sha 94c079cb --geraet headless --nur haar.K4#1 --farm cloud-stationen-a`):
  GRÜN, 1,21 min, Messung `messung/94c079cb-headless.json`, Bilder `messung/roh/94c079cb-headless/haar.K4_1-{1320,1935,schnitt}.png`.
- Die übrigen 17 stehen als `fehlt` (Staffel 1, Grund und Zahl beim Namen) in `stationen/g1.js`, `g2.js`, `g3.js` — 16 neu,
  vegetation.K3 stand schon; dazu haar.K4#2 (kein Tuch-Löser).

## Bilanz

1 GRÜN mit Station (haar.K4, Staffel 1: +1 Punkt, sobald gebucht) · 4 ROT mit Zahl (haar.K5, schatten.K3, schatten.K4,
lod.K4) · 1 ungemessen, die Linse fehlt (schatten.K2) · 12 unmessbar ohne neues Spiel bzw. ohne REF (wetter.K4, physik.K4,
physik.K5, stoffe.K4, vegetation.K3, haar.K3, luftwasser.K3, luftwasser.K4, licht.K4, ferne.K3, ferne.K4, schatten.K5).
`liste --kopf 94c079cb`: 222 Stationen · 130 Kriterien · fehlt 30 · Fehler 0; `selbsttest --ohne 3c` GRÜN.
