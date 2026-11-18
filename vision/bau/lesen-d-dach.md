# Lesen (d): Dach, Traufe, Schornstein, Wasser — main 18058dba

**Feld:** fachwerk-core.js (12 518) · stamm/stoff-dach.js (300) · stamm/siedlung-bauten.js (3 447, kein Dach-Wert gefunden) ·
stamm/siedlung-instanz.js (1 323, nur `_dachKastenSetzen`-Aufruf :900) · stamm/siedlung-bewohner.js (4 000, Rauch) ·
stamm/siedlung-wege.js (2 995, Stadt-Ferne) · stamm/stoff-material.js (3 859, NAESSE) · stamm/siedlung-ort.js (Epoche).

**Kurzbefund.** Das Dach hat EIN Gerüst, das wirklich trägt: `ridgeY = Traufe + D/2·tan(Neigung)` (fachwerk-core.js:216), daraus
die eine Steigung `mS` (:218), die Dachhaut `roofSkinY` (:222), das Deckungs-Gesetz `eindeckenFlaeche` (:233) und die Masse (:1800),
die Nah-, Fern- und Stadt-Stufe lesen. Aber die NEIGUNG selbst ist eine Tafel: 32 Kultur-Zahlen (:2122–2153) ±2,5° Würfel, nach unten
geklemmt durch eine Stil-Grenzneigung (:160) — kein Klima, keine Schneelast, kein Niederschlag; Region und Kultur würfelt der Samen
(:4410, :3718), nicht der Ort. Überstand (0,42/0,32 m, :181) gilt für JEDES Haus aller 32 Kulturen; der Schornstein steht dort, wo
der Samen ihn hinwirft (:586–592), und die Küche folgt ihm (:588) — nicht umgekehrt; Rinne, Fallrohr und Schnee tragen kein Wasser
(nicht gefunden). Fünf von sechs Sonder-Dachformen (Mansard, Pyramide, Kegel, Pult, Tonne, Schmetterling) erreicht die Welt nie.

## (1) WAS TRÄGT

| Gesetz | datei:zeile | Leser |
|---|---|---|
| `grenzNeigung(P)` / `STIL_GRENZNEIGUNG` | fachwerk-core.js:160–166 | HAUS-Klemme :208 · `bauRezept` :2230 |
| `_bauweiseWurf` (pitch→W→D→st aus KULTUR) | :2204–2216 | `bauRezept` :2225 ← DORF :4436, :4450, :4462, :4381, :4398, :4473 |
| `ridgeY`, `mS` (EINE Steigung) | :216, :218 | Dachhaut :222, Flügel :521/:1390, Notch :722, Herd-Flügeltest :594, Masse :1800 |
| `ROOFMODE` (EINE Dach-Quelle) | :217 | giebel :727, dachwerk :773, dachdeckung :805, dachAlt :1711, Masse `dach` :1800 |
| `roofSkinY` / `roofUnderY` (Metagesetz Dachunterkante) | :222–227 | Gaube :256, Verwahrung :929, Geländer :942–953, Sturz :970, Fenster-Deckel :1080 |
| `eindeckenFlaeche` (EINE Deckung) | :233–252 | Hauptdach :839–840, Gaube :801, Kreuzdach :1395, Quergiebel :1418, Balkon :1452, Portikus :1735 |
| `hasAttic` (First − Traufe > NORM.kopfSpar 1,9) | :255 | Gaube :256, Estrich :399/:880, Treppe :463 |
| `herd()` + `chimney`-AABB | :919–932 | `masseVon` :2921 (Kamin als Masse), `kaminSpitze` :5969 → exportSettlement :5928, Hülle :6227/:6248 |
| Masse `haupt` {eY,rY,hip,ovZ,ovX,curve,dachRolle} | :1800 | `koerperListe` sattel/schwung :3073–3102 (Fern-Körper L2/Stufe 3) |
| `hausMasse` [W,D,Traufe,First] | :4119–4120 | `kachelMassen` :4112, `planMassen` :4135 → siedlung-wege.js:2061/2075 → `_stadtFerneBauen` :2224–2246 |
| `deckenZeile` + `DECKE_HOEHE` (Decke = Traufe) | :6102–6113 | Hülle `decken` → stoff-dach.js `_dachTakt` :164 → `_offenerHimmel` :12, `_raumHimmel` :51, `_augeUnterDach` :139 |
| `_dachKastenSetzen` (Decke ohne Hülle) | stoff-dach.js:266 | siedlung-instanz.js:900 → `_dachTakt` :175 |
| `_updateDorfRauch` + `RAUCH_GESETZ` | siedlung-bewohner.js:7–119; fachwerk-core.js:11239 | Quelle `chimney`/`rauchQuelle` (gelaende-kollision.js:257–263, :1179) |

## (2) DIE GRÖSSEN

(fw = fachwerk-core.js; sb = stamm/siedlung-bewohner.js; sw = stamm/siedlung-wege.js; sm = stamm/stoff-material.js)

| # | Name | Wert | Einheit | datei:zeile | Anker | Leser | Urteil |
|---|---|---|---|---|---|---|---|
| 1 | pitchDeg Default | 50 | ° | fw:171 | keiner | fw:208 (überschrieben vom Rezept) | GESETZT |
| 2 | KULTUR.pitch (32 Zahlen, 8…60) | z. B. alemannisch 55, italienisch 23, griechisch 12 (keine Kultur trägt Stil stroh) | ° | fw:2122–2153 | Etikett („Schiefer, hoch“ :2127) | `_bauweiseWurf` fw:2207 | GESETZT |
| 3 | Neigungs-Streuung | ±2,5 | ° | fw:2207 | keiner (Samen) | fw:2207 | GESETZT |
| 4 | Neigungs-Klemme Rezept | 8…62 | ° | fw:2207 | keiner | fw:2207 | GESETZT |
| 5 | Neigungs-Deckel HAUS | 62 | ° | fw:208 | keiner | fw:216 | GESETZT |
| 6 | STIL_GRENZNEIGUNG | modern 14 · huette 30 · stein 18 · glas 4 · klinker 22 · stroh 38 | ° | fw:160 | Begriff „so flach trägt die Deckung“ (:157), Zahl ohne Beleg | fw:208, fw:2230 | FOLGT (Stil→Mindestneigung), Zahlen GESETZT |
| 7 | Grenzneigung ohne Stil (alt) | 28 | ° | fw:165 | keiner | fw:208 | GESETZT |
| 8 | Halle pitchDeg | 14 | ° | fw:4460 | keiner | HAUS über Rezept | GESETZT |
| 9 | Hof-Anbau pitchDeg | max(28, p−6) | ° | fw:4481 | keiner | HAUS | GESETZT |
| 10 | ridgeY (Firsthöhe) | eaveY + D/2·tan(pitch) | m | fw:216 | Geometrie | fw:218, :222, :1800 | FOLGT (Neigung, Tiefe) |
| 11 | mS (Steigung) | (ridgeY−eaveY)/(D/2) | — | fw:218 | Geometrie | Flügel fw:1390, Notch :722, Herd :594 | FOLGT |
| 12 | eaveY (Traufhöhe) | Oberkante letztes Geschoss | m | fw:215 | Geschosse | fw:216, :707, :1800 | FOLGT (Geschosszahl) |
| 13 | foundH (Sockel) | 0,55 | m | fw:178 | keiner | fw:211 → eaveY | GESETZT |
| 14 | egH / ogH | 2,55 / 2,35 | m | fw:178 | keiner | fw:214 → eaveY | GESETZT |
| 15 | flachGrad (Stadt) | 8 | ° | fw:4072 | keiner | fw:4119 | GESETZT |
| 16 | Stadt-Traufe | storeys·2,7 + 0,5 | m | fw:4072, :4120 | keiner | sw:2242 | GESETZT (Zwilling zu #12) |
| 17 | Stadt-First | tan(pitch)·D/2 | m | fw:4120 | Geometrie | sw:2245 | FOLGT |
| 18 | ovEave (Traufüberstand) | 0,42 | m | fw:181 | keiner — keine Kultur setzt ihn (alpenchalet „weite Dachüberstände“ :2134 nur Etikett) | fw:707, :1800 → fw:3086 | GESETZT |
| 19 | ovRake (Ortgangüberstand) | 0,32 | m | fw:181 | keiner | fw:707, :1800 → fw:3087 | GESETZT |
| 20 | Quergiebel eOv / vOv | 0,32 / 0,30 | m | fw:1411 | keiner | fw:1415–1424 | GESETZT |
| 21 | Kreuzdach-Überstand zOuter | +0,3 | m | fw:1391 | keiner | fw:1393–1407 | GESETZT |
| 22 | Stadt-Überstand ueberM | 0,5 (gesamt) | m | sw:2983 | keiner | sw:2245 | GESETZT |
| 23 | hip Default | 0 | 0…1 | fw:172 | keiner | fw:224, :708, :1800 | GESETZT |
| 24 | KULTUR.hip | japanisch 0,7 · chinesisch 0,85 | 0…1 | fw:2135–2136 | keiner | fw:2211 | GESETZT |
| 25 | Treppengiebel → hip 0 | Regel | — | fw:186 | „Hanse/Holland bauten nie Walm“ | fw:224 | FOLGT |
| 26 | flacher Stil → hip 0 | Regel | — | fw:202 | Stil | fw:224 | FOLGT |
| 27 | ROOFMODE-Wahl | rund/dome/stepped/flat/alt/sattel | — | fw:217 | Merkmale | 6 Dach-Fabriken | FOLGT (Merkmal→Form) |
| 28 | dachTyp je Kultur | nie gesetzt (`k.dachTyp` fehlt in allen 32 Zeilen) | — | fw:2214 | — | — | GESETZT (`sattel`) |
| 29 | Pyramide Spitze | max(2, W·0,42) | m | fw:1713 | keiner | nur Labor | GESETZT |
| 30 | Mansard Knick | 0,55 Höhe · 0,45 Tiefe | — | fw:1714 | keiner | nur Labor | GESETZT |
| 31 | Kegel Spitze | rad·1,8 | m | fw:1715 | keiner | nur Labor | GESETZT |
| 32 | Schmetterling Kehle | eaveY − 0,3 | m | fw:1718 | keiner | nur Labor | GESETZT |
| 33 | Rundbau Spitze | rad·1,3 / Zwiebel 1,7 | m | fw:1629 | keiner | Masse `rund` | GESETZT |
| 34 | roofCurve (Schwung) | japanisch 0,5 · chinesisch 0,95 | — | fw:2135–2136 | keiner | fw:272, :3034 | GESETZT |
| 35 | Schwung-Hub | 1,35·curve, Exponent 2,2 | m | fw:272/:274 | keiner | Deform-Feld | GESETZT |
| 36 | Ziegel tw / tl / tt / cs | 0,26 / 0,34 / 0,03 / 0,205 | m | fw:233 | keiner | alle Deckungs-Aufrufe | GESETZT |
| 37 | Ziegel-Lift | 0,08 (Default) / 0,10 Haupt | m | fw:233, :839 | keiner | fw:3017 HAUT_LIFT | GESETZT |
| 38 | Textur-Biber breite / deck | 0,18 / 0,32 | m | fw:1851 | „Biberschwanz“ benannt (:1961) | `texDach` fw:1963 | GESETZT (mit Namen) |
| 39 | Deckungs-Stoff je Stil | ziegel→stroh/stamm/dachmod | — | fw:191–196 | Stil | `mat()` fw:204 | FOLGT (Stil→Stoff); Form bleibt Ziegelreihe |
| 40 | Ziegelfarbe je Kultur | col.ziegel/ziegel2 | sRGB | fw:2122–2153 | keiner | `tintM` fw:2162 | GESETZT |
| 41 | Dachtrim-Stoff | Metall (modern/glas) / Lattung | — | fw:199 | Stil | :1407, :1424, :1736 | FOLGT |
| 42 | Unterdach-Abstand | 0,055 | m | fw:805 | keiner | dachUnter :809 | GESETZT |
| 43 | roofY-Offset | 0,13 | m | fw:724 | keiner | export `roofY` :1811 | GESETZT |
| 44 | Traufabwurf | eaveY − ovEave·tan | m | fw:833 | Geometrie | :839 | FOLGT |
| 45 | Firstziegel | 0,16 × 0,24 | m | fw:849 | keiner | Bild | GESETZT |
| 46 | Windbrett | 0,13 | m | fw:855 | keiner | Bild | GESETZT |
| 47 | Traufrinne Haupt | 0,11 × 0,13, +0,09 vor Traufe | m | fw:837 | keiner | nur Bild (kein Wasser) | GESETZT |
| 48 | Traufrinne Flügel / Quergiebel | 0,13×0,11 / 0,12 | m | fw:1399, :1415 | keiner | nur Bild | GESETZT |
| 49 | Kehlblech | 0,26 | m | fw:1408 | keiner | Bild | GESETZT |
| 50 | Treppengiebel Stufe / Sims | 0,42 / 0,13 | m | fw:766 | keiner | Bild | GESETZT |
| 51 | Pfette B×H / Sparren B×H | 0,14×0,18 / 0,10×0,15 | m | fw:180 | keiner (keine Spannweite, keine Last) | dachwerk :776–795 | GESETZT |
| 52 | Firststuhl-Höhe | ≥ eaveY + 1,98 | m | fw:783 | Spieler-Höhe | :788 | FOLGT |
| 53 | NORM.kopfSpar | 1,90 | m | fw:254 | „SIA 500 / DIN 18065“ :253 | hasAttic :255, :382 | FOLGT (Norm) |
| 54 | Kniestock-Höhe | 1,15 | m | fw:887 | keiner | :887 | GESETZT |
| 55 | Gauben-Bedingung | !modern · hip < 0,45 · D > 5,5 | — | fw:256 | keiner (außer hasAttic) | dachwerk :796, dachdeckung :838 | GESETZT |
| 56 | Gauben-Lage gx | ((seed%5)−2)·0,5 | m | fw:256 | Samen | dto. | GESETZT |
| 57 | Gauben-Breite | clamp(W·0,16; 1,15; 1,6) | m | fw:256 | keiner | dto. | GESETZT |
| 58 | Gauben-Tiefe / Rücklage / Mindesthöhe | 1,0 / −D·0,22 / 0,85 | m | fw:256 | keiner | dto. | GESETZT |
| 59 | Gauben-Zahl | höchstens 1 | — | fw:256 | keiner | dto. | GESETZT |
| 60 | Giebelfenster | hip<0,6 · Höhe>1,25 · w 0,8 · h 0,66 · cy 0,42/0,95 | m | fw:713 | keiner | giebel :729, Licht :1793 | GESETZT |
| 61 | Flügel-Traufe | min(baseY+egH·0,86; eaveY−0,8) | m | fw:521 | keiner | Flügeldach :1411 | GESETZT |
| 62 | Flügel-First | ≤ eaveY − 0,3 | m | fw:521 | keiner | dto. | GESETZT |
| 63 | Kreuzdach eYw / rYw | eaveY−0,06 / ≤ ridgeY−0,2, Neigung = mS | m | fw:1390 | mS | :1391–1409 | FOLGT (Neigung), Abstände GESETZT |
| 64 | Anbau-Pult Gefälle | 0,20 (≈ 11,3°) | m/m | fw:541 | keiner — liegt unter jeder Grenzneigung außer glas (:160) | :1278 | GESETZT |
| 65 | Anbau-Traufe yLow | baseY + 2,18 | m | fw:540 | keiner | :1278 | GESETZT |
| 66 | Anbau-Breite gw | 2,9…3,7 (Samen) | m | fw:538 | „Stellplatz-Funktion“ | :540 | GESETZT |
| 67 | Balkon-Pultdächlein | yF+2,05, Abfall 0,35 | m | fw:1450–1452 | keiner | Bild | GESETZT |
| 68 | Kamin-Existenz | 1 je Haus, außer rund/kuppel/modern | — | fw:919 | Stil | `chimney` :932 | GESETZT (nicht aus Raumprogramm) |
| 69 | Herd-Seite / Lage | Samen-Hash `_chS`, z = (chS−0,5)·1,7 | m | fw:586, :591–592 | Samen | herd :920, Fensterkorridor :597, Innenwand :906 | GESETZT |
| 70 | Herd-Körper | 1,5 × 1,1 (bD 1,05, bW 1,5, bH 1,0) | m | fw:589, :592, :920 | keiner | :922 | GESETZT |
| 71 | Kaminkopf über First | ridgeY + 0,9 | m | fw:928 | keiner (keine Norm zitiert) | `chimney` :932 → Rauch | FOLGT (First) + GESETZT (0,9) |
| 72 | Kaminbreite STACK_W | 0,84 (Schaft ×0,83) | m | fw:219, :928 | keiner | Korridor :597, AABB :932 | GESETZT |
| 73 | Verwahrung / Kopfplatte | +0,22 / +0,14 | m | fw:929–930 | keiner | Bild | GESETZT |
| 74 | Rauch-Spitze | AABB-Mitte, +0,2 | m | fw:5973 | AABB | sb:25–41 | FOLGT |
| 75 | RAUCH_GESETZ | 26 Teilchen · 0,3 · vy 0,014+0,012 · fade 0,0035 … | — | fw:11239–11250 | „Feel-Entscheid“ (:11253) | sb:92–107 | GESETZT |
| 76 | Rauch-Wind | `_windAt` je Teilchen | m/s | sb:116–119 | Wind-Gesetz | sb:118 | FOLGT |
| 77 | Rauch an/aus | immer an (kein Tag, kein Bewohner, kein Herd-Betrieb) | — | sb:95–107 | keiner | — | GESETZT |
| 78 | RAUCH_BILD kamine / kamineM | 8 / 160 | — / m | sb:3871–3872 | Kosten | sb:80–86 | GESETZT |
| 79 | Decken-Höhe (Regenschutz) | Traufe je Masse (`DECKE_HOEHE`) | m | fw:6102 | Massen | stoff-dach.js:194–216 | FOLGT (ohne Überstand) |
| 80 | NAESSE dachPlaetze / UmkreisM / SchrittM | 8 / 64 / 4 | — / m / m | sm:3793–3795 | Kosten | stoff-dach.js:170, :176 | GESETZT |
| 81 | dachArten (Bauten ohne Hülle) | marktstand · brunnen · gate | — | sm:3796 | keiner | stoff-dach.js:269 | GESETZT |
| 82 | Fern-Körper innen (dach) | 0,03 | m | fw:2873 | Schattenakne (:2867) | koerperListe | GESETZT |
| 83 | PROXYHAUS Geschoss / Überstand / Kamin | 2,75 / 0,45 / x=W·0,24, h=rise·1,1+0,8 | m | fw:4542, :4559, :4565 | keiner | nur Labor (Grep: fw:12399, worlds/fachwerk) | GESETZT |
| 84 | Region des Orts | Würfel .30/.46/.64/.76/.88 | — | fw:4410 | Samen | `poolAt` :4424 → Kultur → pitch | GESETZT |

## (3) ZWILLINGE UND TOTE

- **Traufhöhe dreifach:** HAUS 0,55 + 2,55 + 2,35·(n−1) (fw:178/:214; 2 Geschosse = 5,45 m) · Stadt-Ferne n·2,7 + 0,5 (fw:4120; = 5,90 m)
  · PROXYHAUS n·2,75 (fw:4542; = 5,50 m). Drei Zahlen für dieselbe Traufe.
- **Überstand dreifach:** 0,42/0,32 (fw:181) · 0,45 (PROXYHAUS fw:4559) · 0,25 je Seite (`ueberM` 0,5, sw:2983).
- **Walm verloren in der Stadt-Ferne:** `hausMasse` trägt nur [W, D, Traufe, First] (fw:4120); das Pool-Prisma ist immer ein Satteldach
  (sw:2177–2187) — chinesisch hip 0,85 steht fern als Sattel.
- **Sonderdächer Nah ≠ Fern:** Pyramide `max(2, W·0,42)` fw:1713 ≡ fw:3092 (Zwilling, gleich); Kegel 1,8 fw:1715 ≡ fw:3093; Mansard und
  Tonne fern als Satteldach (fw:3094–3095) — Silhouette weicht. Toter Pfad zugleich: kein Welt-Schreiber setzt `dachTyp` außer
  `'flach'` (fw:2735, :4457) und `'sattel'` (fw:4482); Grep `mansard|pyramide|schmetterling|kegel` in *.js/stamm: nur fw:1713–1718, :3092–3101.
- **Schwung zweimal gerechnet:** `DEF_cA = 1,35·curve`, Exponent 2,2 (fw:272/:274) und `cA = 1,35·m.curve`, 2,2 (fw:3034/:3038).
- **Ziegelmaß zweimal:** fw:233 (`tw 0,26 · tl 0,34 · cs 0,205`) und fw:841 (dieselben Literale ohne Großformat-Faktor, für den Walm);
  dazu das Textur-Maß 0,18 × 0,32 (fw:1851) — Geometrie-Ziegel und Bild-Ziegel haben verschiedene Maße.
- **Kamin dreifach:** HAUS am Herd (fw:928) · PROXYHAUS bei x = W·0,24 ohne Herd (fw:4565) · Stadt-Ferne ohne Kamin (sw:2224–2246).
- **Grenzneigung schon einmal geheilt** (fw:157–159: „tote Zahl … 18° gebaut“), aber Anbau-Pult 11,3° (fw:541), Balkon-Dächlein (fw:1452)
  und Vordach (fw:1571) lesen sie nicht.
- **Ungelesene/tote Felder:** `ovEave`/`ovRake` stehen in keiner KULTUR-Zeile (fw:2122–2153; `_bauweiseWurf` fw:2206–2215 gibt sie nicht aus);
  das Etikett „weite Dachüberstände“ (fw:2134) ist ohne Leser. Der Stil `stroh` (Grenzneigung 38°, fw:160/:196) steht in keiner der
  32 KULTUR-Zeilen (fw:2122–2153) — das Strohdach entsteht in der Welt nie. PROXYHAUS: Leser nur `worlds/fachwerk` (Grep `PROXYHAUS` → fw + worlds/fachwerk/fachwerk.js).
- **Herd ↔ Küche verkehrt:** „Küche folgt dem Herd (nearest-room), NICHT der Herd der Küche“ (fw:588); `BAU_NUTZUNG.wohnhaus` kennt nur
  `wohnen` (fw:2183) — kein Raum `kueche`/`herd` im Programm.
- **Traufrinne ohne Wasser:** Balken `'dunkel'` (fw:837, :1399, :1415, :1737); kein Fallrohr, kein Ablauf (Grep
  `dachwasser|wasserspeier|fallrohr|regenrinne|traufwasser|ablauf.*dach` → nur bau-vorlagen.js:1671, die Algen der Alterung).
- **Regenschutz ohne Überstand:** die Decke des Dach-Pools endet an der Wand (fw:6102/:6110, stoff-dach.js:157) — unter dem 0,42-m-Überstand regnet es.
- **Schnee auf dem Dach:** nicht gefunden (gesucht `schnee|snow` in fachwerk-core.js, stamm/stoff-*.js, stamm/siedlung-*.js: einziger Treffer siedlung-wege.js:2522, Boden).

## (4) WAS DER SAMEN ERREICHT

| Eingang | kommt an? | Beleg |
|---|---|---|
| Samen | JA, überall: Region (fw:4410), Kultur (:4435), Neigung ±2,5° (:2207), Gaube (:256), Herd/Kamin (:586), Anbau-Breite (:538) | — |
| Epoche/Jahr | JA, über den Kultur-Pool `REGION_HIST` (fw:3609–3615) → Kultur-Zeile → pitch/hip/curve/stil | fw:4424, :4435 |
| Ort / Klima | NEIN für das Dach — die Region würfelt der Samen (fw:4410) bzw. die Legende `siedlungsEpoche` (fw:3718, Samen-Hash); das Klima erreicht nur den Hof-Baum (siedlung-ort.js:1694) | gesucht `klima|niederschlag|schnee` in fachwerk-core.js: kein Dach-Treffer |
| Stoff / Deckung | TEILWEISE: Stil → Grenzneigung (fw:160/:208) und Stoff-Tausch (fw:191–196); die Form der Deckung bleibt Ziegelreihe für Stroh, Schindel, Schiefer (fw:233, eine Rolle `'ziegel'`) | fw:244–250 |
| Regen | NUR als Schutz-Abfrage (stoff-dach.js:12–40) und Alterung (bau-vorlagen.js:1671); nicht in Überstand, Neigung, Rinne | — |
| Schneelast / Wind auf Dach | NEIN (nicht gefunden); Wind erreicht nur den Rauch (sb:116) | — |
| Herd / Raumprogramm | NEIN — Herd aus Samen, Küche folgt ihm (fw:588); Kamin fehlt nur nach Stil (fw:919) | — |
| Nutzung | JA für Maße (W, D, storeys, zinnen, arkade: fw:2184–2200) → Traufe/First folgen; nie für Dachform direkt | fw:2227–2228 |
| Geschosse | JA → Traufe (fw:215) → First (fw:216) → Kaminkopf (fw:928) | — |

Größen gesamt 84 · davon GESETZT ohne Anker 55 (+ 3 nur Samen: #56, #69, #84; + 8 GESETZT mit benanntem Anker) · davon FOLGT 18 (inkl. der Mischzeilen #6, #63, #71, deren Zahl selbst GESETZT bleibt)
