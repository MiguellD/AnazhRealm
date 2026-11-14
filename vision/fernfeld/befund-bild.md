# Befund Bild und Messung — wo bricht die Ferne SICHTBAR, und welche Linse sieht es heute?

Stand: Lese-Baum `lese-main` = 68d24688 (V18.546.289), Zweig koordination am 14.11. 22:21 (date). Keine GPU, keine Welt gestartet —
nur gelesen und Bilder angesehen. Bildkoordinaten (x, y) in Pixeln des jeweiligen Bilds, Ursprung oben links.

## 1. Die Bilder (selbst angesehen, 8 Stück)

| # | Bild | Ort |
|---|------|-----|
| B1 | `artifacts/profiband/auge/w28-auge/b6d828a0-dorf-0.5.png` (1920×1080) | Dorf, Ego, Uhr 0,5 |
| B2 | `artifacts/profiband/auge/w28-auge/b6d828a0-genesis-0.5.png` (1920×1080) | Ankunft (Genesis-Ring), Uhr 0,5 |
| B3 | `artifacts/profiband/auge/w28-stadt-grammatik/markt-2-kandidat-a9f6f6bc.png` | Markt |
| B4 | `artifacts/profiband/auge/1114-ankunft/sg-163f3e0b-stadt-voll-0.5.png` | Stadt-Markt, Uhr 0,5 |
| B5 | koordination `probe-post/w28-ziel-plan/58acfa5e-stadt-0.4.png` | Stadt-Gasse, Uhr 0,4 |
| B6 | koordination `probe-post/w28-wiese-schale/97df3853-wiese-0.5.png` | Mess-Wiese, Uhr 0,5 |
| B7 | `artifacts/profiband/auge/w28-gesicht/paar-6m-offen.jpg` | Ankunft, Figur 6 m (Paar) |
| B8 | `artifacts/profiband/auge/w28-stoff-fuge/paar-wechsel4-dach-0.3.png` | Dorf-Dach, drei Posen (Bewegung) |

Je Bild, was in der Nähe trägt:
- **B1 Dorf:** die zwei nahen Bewohnerinnen (830–960 × 640–1040, 1150–1300 × 620–990) tragen Leib, Kleid, Haar, Schatten; die Blumen
  rechts (1800–1850 × 840–920) und die Steine (1640–1760 × 760–830) tragen Form.
- **B2 Ankunft:** Tore, Laterne, Bank (1310–1500 × 650–760) tragen; das Pflaster direkt vor der Kamera (y > 950) liest sich als Stein.
- **B3 Markt:** die vier nahen Leiber (580–640, 1040–1160, 1390–1550, 1580–1920) tragen Gesicht/Kleid, die Stände tragen Holz.
- **B6 Wiese:** die Nah-Wiese (y > 600) trägt dicht, Halm und Ähre lesbar — der bewiesene Fall „Größe statt Zahl“ hält hier.
- **B7:** die Figur bei 6 m trägt Leib und Gesicht.

## 2. Tafel — Bruch der Ferne je Klasse

„Sieht er es heute“ = es gibt einen Richter, der an DIESER Art Pose genau DIESES Merkmal misst und bei diesem Bild ROT werden müsste.

| Klasse | Bild / Koordinate | was man sieht | welcher Richter es sehen müsste | sieht er es heute? |
|---|---|---|---|---|
| **Leib** | B1 (440–495 × 550–710), Figur ~160 px hoch; (335–365 × 495–590) ~95 px; Gruppe (545–660 × 485–590) ~80–100 px | Stapel aus drei Klumpen (Kopf-, Rumpf-, Bein-Kapsel), weiße Kastenbeine, kein Arm, keine Hand — obwohl die Figur weit über der Menge-Schwelle 64 px steht | ein Leib-Stufen-Richter am Schirm (Pixel-Höhe der Figur beim Stufen-Tausch) | **nein** — lod.K5 hat keine Familie Leib (g3.js:3256–3264: Baum, Streu, Wagen, Haus, Tor, Ausstattung); gate:pop läuft an der Mess-Wiese ohne Bewohner; die Soll-Tafel hat keine Klasse Mensch-fern |
| **Leib** | B3 (0–130 × 590–860), ~270 px hoch, am linken Rand; (1150–1200 × 565–730), (1335–1390 × 570–720), (1700–1830 × 575–740) je ~150–165 px | dieselben Klumpen-Stapel mitten im Markt, 6–12 m fern, eine davon größer als die nahen Leiber; Klumpe und Leib stehen nebeneinander gleich groß | derselbe | **nein** |
| **Leib** | B5 (795–925 × 495–635) ~110 px | Klumpen mit weißen Block-Beinen auf der Wiese der Gasse | derselbe | **nein** |
| **Haus** | B1 nahes Haus (740–1440 × 60–700), linke Häuser (0–450 × 280–600) | glatte weiße Kiste: Putz ohne Relief, Fenster als dunkle Rechtecke ohne Laibung, Sockel als einfarbiges Band | Relief/Normal der Fassade je Abstand | **nein** — Soll-Tafel `haus` misst nur `albedoVerhaeltnis` Labor/Welt (spec/abnahme/soll-tafel.json, Eintrag `haus`, Verweis spec/farbe/albedo-tafel.json) |
| **Haus** | B4 Hochhaus (1460–1880 × 0–700); B3 (360–860 × 240–600) | glatte Wand fast ohne Fenster, kein Gesims, keine Fuge; im Markt die Fassaden flach bemalt | derselbe; dazu lod.K3 „Karte je Familie“ | **nein** — lod.K3 nennt selbst „Haus und Tor sind fern NUR-WURF“ (g3.js:3662–3666), als offen, ohne Bild-Urteil |
| **Haus** | B5 rechts (1380–1920 × 300–720), links (0–600 × 150–590) | Wand **halb durchsichtig**: Innen-Fenster und Gerüst-Linien scheinen durch die Fassade („Geist-Haus“) | ein Deckungs-Richter (Wand deckt) | **nein** |
| **Krone** | B2 (0–600 × 30–600), Schlieren senkrecht (90–200 × 100–300) | Kronen als verschmierte Fläche, Pinselstrich statt Blatt-Masse, senkrechte Streifen | laub (zweiton, Dither) + laub-kante (Umriss) | **teils** — lod.K1#1 misst Kante ≤ 0,22 an EINER Tafel-Pose (−284/1,7/−1042, g3.js:3123) und einem Spielgang an der Wiese; heute ROT 0,2635 (PFLICHT-OFFEN A); die Schmiere im Inneren der Krone misst keiner |
| **Krone** | B2 (1380–1480 × 270–335) | halb durchsichtiger Fetzen schwebt frei im Himmel über der Krone | laub-kante (Außen-Pixel) | **nein** — die Kante urteilt den Umriss der zusammenhängenden Krone, nicht einen abgelösten Fetzen (abnahme-urteil.cjs:846ff, „ZUSAMMENHANG“) — nicht nachgemessen |
| **Krone** | B3 (1560–1650 × 270–420); B1 (1430–1900 × 0–300) | grau-grüner Dither-Schleier am Kronen-Rand gegen Himmel; im Dorf Klumpen mit Schmier-Kante | laub zweiton / laub-kante | **teils** (nur an der Tafel-Pose, nicht im Dorf/Markt) |
| **Wiese** | B2 (80–580 × 590–750), (720–1010 × 600–690), (1120–1500 × 600–700) | Inseln mit harter Kante gegen das Pflaster, Halme als große gelbe Zacken (die Fern-Größe sichtbar als Spitz-Kamm) | ein Saum-Richter Wiese↔Pflaster | **nein** — ferneWand (diag-profiband.cjs:299–341) prüft das Gesetz ohne Pixel; vegetation.K1 misst Lücke/LAI an der Mess-Wiese |
| **Wiese** | B6 (450–1000 × 495–560), 30–60 m | Halme in **Reihen** — das Teil-Gitter steht als Zeilen-Muster im Bild | Regelmäßigkeit/Periode im Bild | **nein** — ferneWand prüft `rest.size ≤ 1` und Rang-Brüche (Gesetz), vegetation.K1 die Lücke, keiner die Periode im Bild |
| **Boden** | B2, B3, B4 Pflaster (0–1920 × 620–1000) | **Moiré**: konzentrische Bögen über der ganzen unteren Bildhälfte (B2 ~30 % der Pixel), wandert mit jeder Bewegung | Aliasing-/Periodik-Richter am Boden | **nein** — kein Richter: Grep `Moir` in scripts/ 0 Treffer, `Aliasing` nur ein Index-Kommentar (scripts/playtest/gelaende-boden.cjs:210) |
| **Boden** | B1 Schatten (700–1500 × 690–890), Weg (0–1900 × 600–1080) | Schatten als blau-schwarzes Salz-und-Pfeffer-Rauschen, Weg körnig; lila Schleier (100–900 × 650–850) | Rauschen-Richter am Boden fern | **nein** — gate:nah-fern misst Albedo-Mittel orthogonal aus 420 m (diag-nah-fern.cjs:1–8); ein Mittel sieht kein Rauschen |
| **Gelände** | B1 Hang (1480–1900 × 200–640) | glatter brauner Hang, weiche Flecken, kein Fels, keine Rinne | Relief der Ferne / „Ferne = Nähe“ | **nein** — blatt/29-bild.md:31–42 L1 „Ferne = Nähe“ steht als Plan (P), kein Code |
| **Gelände** | B6 Horizont (840–1300 × 480–540) | ferne Stämme als Reihe weißer Zaunlatten | derselbe | **nein** |
| **Himmel-Kante** | B2 (780–900 × 500–560), B2 (1380–1480 × 270–335) | grauer flacher Streifen am Horizont; Laub-Fetzen im Himmel | Horizont-/Kanten-Richter | **nein** |
| **Dach (Bewegung)** | B8 Feld 3 (1230–1620 × 60–250) gegen Feld 1 (0–600 × 80–360) | beim Schritt kippt die Ziegel-Struktur in Längs-Streifen — das Flackern ist ein Stufen-/Ton-Wechsel unter Bewegung | gate:pop am Dorf | **nein** — gate:pop läuft nur an der Mess-Wiese (werkbank.cjs:3180) |

## 3. Die Richter der Ferne — was GENAU sie messen

1. **gate:pop = lod.K2#1** — `scripts/werkbank.cjs:376–433` (`popGang`), Urteil `:3176–3198`. Pose: Mess-Wiese, Ego, `KAM_FOV_GRAD`,
   8 Schritte à 0,5 m geradeaus (4 m = „eine Sekunde“). Maß: Pixel mit ΔLuma > 18 (Rec. 709) zwischen Schuss A und B am selben Ort.
   Schwelle: ≤ 0,05 % Pop-Pixel/s (`:3190`). Heute (LAGE, nicht neu gemessen): Radeon 0,0487 % GRÜN, GTX 1050 0,051 % ROT. Den Täter
   nennt er nur unter `st.architectures` (`:420–424`). **Sieht NICHT:** Dorf, Markt, Ankunft; Bewohner (es gibt keine an der Wiese);
   Tele (FOV fest); Drehung; Third; andere Uhr; den Stufen-Tausch einer Figur.
2. **gate:nah-fern** — `scripts/diag-nah-fern.cjs:1–49`, Urteil `scripts/lib/licht-linsen.cjs:1540ff`. Pose: orthogonal aus 420 m
   über 132 m, Mess-Wiese, je ≥ 3 Wald- und 3 Wiesen-Orte. Maß: Albedo-Mittel Boden-Satz gegen Fern-Ring gegen das Gesetz
   (`_fernRingTeile`). Band: nah 0,1, fern 0,25, Grün 0,03/0,05 (`:1541`). **Sieht NICHT:** jede Perspektive auf Augenhöhe, Rauschen,
   Moiré, Silhouette, Figur, Haus.
3. **ferneWand (P-Ferne)** — `scripts/diag-profiband.cjs:299–341`, drei Mutanten `:1173–1179`. Headless, Wiese allein: Lücke ≥ 0,99,
   Schirm ≤ 2×, Gestalt unverformt, Größe 1 → ≤ skalaMax, Deckung ≥ 0,99, affin, Teil-Gitter EINE Restklasse, Rang-Brüche 0.
   **Sieht NICHT:** ein Pixel; die Reihen in B6; den Saum zum Pflaster in B2.
4. **lod.K5#1** — meisterkarte `stationen/g3.js:3151ff`, Gesetz `_wechselGesetz` (stamm/vegetation-streu.js), `LOD_SCHIRM.px = 1`
   (`vegetation-streu.js:2880–2882`). Maß: Fehler der Stufe am Schirm im Wechsel-Abstand ≤ 1 px; 29.10.: Baum 12,06 · Haus 2,95 ·
   Tor 7,85 · Wagen 0,02 · Ausstattung 0,72 px (g3.js:3256–3262). Pose: Wiese. **Sieht NICHT:** Leib/Menge (keine Familie).
5. **lod.K1#1 laub-kante** — `g3.js:3116–3130`, Klassen `LAUB_KLASSE` (`g3.js:622`), Urteil `abnahme-urteil.cjs` (Kante, `:643ff`).
   Pose: Tafel (−284, 1,7, −1042) + Spielgang an der Wiese. Schwelle kante ≤ 0,22. Heute ROT 0,2635 (PFLICHT-OFFEN A).
   **Sieht NICHT:** die Schmiere im Kronen-Inneren, abgelöste Fetzen, die Krone im Dorf/Markt.
6. **lod.K3** — `g3.js:3596ff/3662ff`: Karte je Familie; Haus und Tor fern „NUR-WURF“, Wagen ohne Karte — als offen benannt, kein Bild-Urteil.
7. **vegetation.K1** — `g2.js:1929ff` (`wieseStation`), Staffel 2 ohne Befehl (`g2.js:6076`). Maß: LAI/Grund-Lücke der Wiese je Ring
   an Mess-Wiesen-Posen. Heute rot 4,2 % (LAGE). **Sieht NICHT:** Periodik, Saum am Pflaster, Ankunft.
8. **Soll-Tafel AAAA** — `spec/abnahme/soll-tafel.json`: 14 Einträge (boden-nah, himmel-licht, laub, laub-kante, haus, wasser,
   tor-fern, tor-bunt, tor-ziel, fels, mensch-kopf, boden-nah-farbe, fell, haar). **Es fehlen:** Mensch-fern/Menge, Boden-fern/Pflaster,
   Gelände-fern. `haus` misst nur das Albedo-Verhältnis.
9. **Meisterkarte 2, blatt/29-bild.md:31–42** „Ferne = Nähe“ (Ziel fotografiert, hingeflogen, nah verglichen, ≥ 0,8) und `:114`
   „Leuchtdichte springt an keinem Stufen-Wechsel > 5 %“ — als Leiter beschrieben, im Code nicht vorhanden (Grep „Ferne = Nähe“ in scripts/ und stamm/: 0 Dateien).

**Die gemeinsame Lücke:** jeder Richter der Ferne steht an der Mess-Wiese (oder orthogonal darüber). Keiner steht im Dorf, am Markt
oder an der Ankunft auf Augenhöhe; keiner unter Drehung, am Tele, im Third; keiner misst Rauschen/Periodik; keiner kennt den Leib.

## 4. Die Wurzel des schwersten Bruchs (Leib-Klumpen)

Der Leib ist eine **Zahl** und ein **Abstand**, kein Schirm-Gesetz: `AnazhRealm.BEWOHNER.nahM: 8`, `nahLeiber: 4`
(stamm/siedlung-bewohner.js:3583–3585); die Wahl kappt die Liste nach Bedeutung (`:1628–1631`) — jeder fünfte Bewohner im Nah-Kreis
„steht im Satz seiner Gestalt“, auch bei 270 px (B3 links). Ein Schirm-Gesetz gibt es nur für die Menge-Stufe: `LOD_SCHIRM.leib.mengePx 64`
bei `mengeKoerperM 1,8` (vegetation-streu.js:1872, 2884). Zwischen 64 px und „Leib“ liegt der grobe Satz ohne Pixel-Urteil. Das ist der
„je Klasse eigener Abstands-Schalter“, den ein Fernfeld-Gesetz ersetzen muss (Wahl nach Pixel-Höhe × Haushalt, nicht Kopfzahl 4).

## 5. Rangfolge — die drei Brüche, die Ankunft und Dorf am meisten schaden

1. **Leib-Klumpen bei 80–270 px** (B1, B3, B5): der Blick sucht im Dorf zuerst Menschen; jeder zweite Mensch im Bild ist ein
   Kapsel-Stapel neben einem Leib gleicher Größe. Wurzel: `nahLeiber 4`/`nahM 8` statt Schirm. Richter: keiner.
2. **Boden: Pflaster-Moiré an der Ankunft + Rauschen im Dorf** (B2 y 750–1000 ≈ 30 % der Pixel; B1 y 600–1080 ≈ 44 %): größte
   Fläche im Bild, wandert unter Bewegung. Richter: keiner (nah-fern misst nur das Mittel).
3. **Kronen-Schmiere und Fetzen im Hintergrund der Ankunft** (B2 0–600 × 30–600, 1380–1480 × 270–335): das erste Bild jeder
   Ankunft. Richter: laub-kante teils (ROT 0,2635 an einer Pose), Inneres und Fetzen ungesehen.

Danach: flache/halb durchsichtige Häuser (B1, B4, B5 — Richter keiner, `haus` nur Albedo), Wiesen-Saum hart (B2), Reihen der fernen
Wiese (B6), Dach-Flackern unter Bewegung (B8).

## Ehrlich offen

- Nicht nachgemessen: Abstand jeder Klumpen-Figur in Metern (nur Pixel-Höhe aus dem Bild); ob die Tafel-Pose von lod.K1#1 an der Ankunft
  liegt; ob B5 „halb durchsichtig“ ein Ausblenden (Dither) oder ein Stoff-Fehler ist.
- Nicht gelesen: Mess-Dateien `meisterkarte-quelle/punkte/messung/` der letzten Köpfe (die Zahlen 0,0487 / 0,051 / 4,2 % stammen aus
  der LAGE des Auftrags); die übrigen Blätter der Meisterkarte 2 außer 29-bild.md.
