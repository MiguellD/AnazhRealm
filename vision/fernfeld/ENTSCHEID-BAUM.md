# ENTSCHEID BAUM — Vegetation unter dem Schirm: Bild und Preis in EINER Klasse (ZWISCHENSTAND)

Stand 14.11.2026 23:30 (date). Gelesen: die vier Befunde (stufen · linse · wiese · gpu), `vision/preis/ENTSCHEID.md`, `vision/REGELN.md`,
die Quelle an jeder genannten Datei:Zeile im Lese-Baum `lese-main` = main 68d24688, der Vendor `vendor/three.webgpu.min.js` (r184).
Kein Bau, keine GPU, keine Welt. EINE eigene Messung in Node am Lese-Baum: `node scripts/diag-asset-contract.cjs` (Wand L, 64 Kronen,
24 Ansichten, EXIT 0, 23:22). Herkunft: **[q]** Quelle Datei:Zeile · **[k]** Kommentar der Quelle (dort gemessen) · **[n]** heute in
Node gemessen · **[r]** gerechnet · **[v]** Vendor gelesen · **[s]** Schwelle, von mir gesetzt.

## 0. Was die Quelle entschied (wo Befunde einander oder der LAGE widersprechen)

| Aussage | Die Quelle | Folge |
|---|---|---|
| befund-stufen #21: die ferne Wiese folge dem Schirm „GANZ“ | `_wieseFern`/`_wieseFuss` lesen weder Zeilen noch Sichtfeld (stamm/vegetation-wiese.js:577–615 [q]); am Schirm hängt nur der Ein-Pixel-Halm (`_halmFernePixel`, :1196–1199) | befund-wiese hat recht: 2 Schalter folgen ganz (Fell, Tuch), nicht 3 |
| Kommentar vegetation-streu.js:2847 „die Schwellen legt das Gesetz des Schirms“ | `_stufenSchirm` ruft `_wechselAbstand("tree", s, ref)` OHNE Vorlage (:1929–1930) → `e = 0` (:2977) → `max(0, h)·ref` = 12 / 26 m; `_brennweite(zeilen)` wird nie gerufen. :2873 sagt es selbst: „DER BAUM trägt keine Zeile“ | der Baum rechnet in Metern der Wahrnehmungs-Distanz (fester Winkel: 704 / 325 px nur bei 1080 Zeilen) |
| LAGE: „Karte bei 325 px unabhängig von der Höhe“ | `min(lodRef/h, 1)` (:1830): nur für H ≥ 12 m; ein 6-m-Baum tauscht bei 26 m = 162 px | kleine Bäume halten die L1 LÄNGER (in Pixeln) als große |
| LAGE: „Kanten-Versatz 3,2–12,1 px, Backen aus L1“ | das ist die Reihe von w4 (stoff-karte.js:429–430 [k]), vor w10 und vor dem Relief w27. Heute: **1,50–3,16 px** bei 26 m (Eiche 1,50 · Birke 1,58 · Karst 2,41 · Fichte 2,66 · Weide 3,16; :2051–2053 [k]) | die Zahl der Tafel ist 1,50–3,16, nicht 3,2–12,1 |
| befund-gpu: „das Licht läuft vor dem Tiefen-Urteil“ (Verdacht) | der frühe Tiefentest LEBT bei alphaTest: `frag_depth` an der Karte kostete +3,7 ms Radeon / 15,41 → 20,52 ms GTX und fiel deshalb (stoff-material.js:1519–1523 [k]). Was fehlt, ist die REIHE: nichts ordnet Blätter vorn → hinten | die Wurzel heißt Lagen × Reihenfolge, nicht „kein Tiefentest“ |
| „L1 ist die billige Stufe“ | die L1 trägt die Krone der L0 (foundry-core.js:466–467 [q]); gemessen [n]: Quad-Lagen / Alpha-Lagen je Kronen-Pixel — Buche 15,6 / 8,2 · Eiche 15,4 / 8,5 · Birke 14,9 / 7,9 · Karst 14,5 / 6,8 · Weide 12,6 / 4,4 · Tanne 5,8 / 2,6 · Fichte 4,7 / 2,2 · Mammut 4,1 / 2,0, **L1 = L0** | je Bildpunkt kostet die L1 so viel Licht wie die L0; sie spart nur Ecken (Quote 0,21–0,33) |
| befund-gpu Tafel: Kaskaden 1,6 % — Block 1/2: k1 10,7 · k2 5,0–9,5 · k0 1,9 % | derselbe Befund, zwei Zahlen | der Wurf-Anteil der Karte ist UNGETRENNT (bleibt so, §5) |

## 1. DAS GESETZ

**(1)** Jede Stufe der Vegetation zeigt sich ab dem Abstand, an dem der an IHRER Vorlage gemessene Kanten-Versatz zur L0 einen Bildpunkt
des lebenden Zeichenpuffers trägt — Einheit Bildpunkte (`LOD_SCHIRM.px` 1, Brennweite aus `_schirm().hoehe` im Ruhe-Sichtfeld), Maß die
Zeile `LOD_SCHIRM.fehler.tree[Vorlage]`, heute 1,50–3,16 px am Haushalt 26 m, Boden die Texel-Grenze der Zelle 128 × 256 (Weide 1,7 px);
kein Meter-Schalter und keine feste Pixel-Zahl wählt eine Stufe, auch nicht hinter Kronen-Masse.
**(2)** Der Preis der Klasse hängt am sichtbaren Bildpunkt, nie an der Lage: jedes maskierte Fragment (Laub L0/L1, Karte, Gras-Ferne)
urteilt die Tiefe vor dem Licht — das Licht zahlt genau das vorderste Fragment, gleich wie viele Lagen (bis 15,6) dahinter liegen.
**(3)** Die ferne Wiese behält ihre ZAHL als Büschel je Bildpunkt des Ruhe-Schirms (`fuss` 13,8 m bei 1080 × 0,75); ihr gemessener Fehler
ist die Deckung D = (40,5/Q)² jenseits 40,5 m (0,66 · 0,29 · 0,16 bei 50 · 75 · 100 m [r]) — ihn trägt der TON: Grund und Büschel lesen
EINE Blende, nie zwei.

**Urteil über die These („die wahre Karte übernimmt früher → weniger Laub → billiger UND unsichtbar“): sie trägt an der Quelle NICHT.**
- *Das Bild:* die Karte kann bei 325 px nicht wahr sein. Genau aus dem Auge gebacken liegt die Texel-Grenze der Zelle bei der Weide bei
  1,7 px (stoff-karte.js:2053–2054 [k]); früher heißt größer, der Fehler wächst mit 1/d. Die L0 als Quelle senkte den Versatz um
  0,4–2,1 px und ließ 2,82–9,97 px stehen (:429–430 [k], Stand w4) — und stellte je Zelle einen L0-Bau auf den Pfad der Ankunft
  (gate:arch-feld erster Bake Takt 74 → 206, ROT; die Ankunft ist PFLICHT-OFFEN B).
- *Das Gesetz selbst verschiebt hinaus:* mit den gemessenen Zeilen wählt es die Karte bei Eiche 39 · Birke 41 · Karst 63 · Fichte 69 ·
  Weide 82 m statt 26 m [r], also 2,3- bis 10-mal so viele Bäume in 3D-Stufen (die L1 allein 2,6- bis 12-mal) [r]. Am Tausch-Abstand
  ziehen Bild und Preis GEGENEINANDER; die Quelle hat es schon gemessen: 20/40 statt 12/26 kostete Frame p50 33,5 → 41,9 ms, das Band
  ROT (foundry-core.js:413–417 [k]).
- *Was an der These stimmt, und was stattdessen trägt:* ihr Preis-Mechanismus ist echt — eine Karte ist EINE Lage, die L1 fünfzehn.
  Genau diesen Gewinn holt die Tiefe vor dem Licht OHNE Bildtausch: Alpha-Lagen 6,8–8,5 → 1 am Laub, 2,0–2,6 → 1 an der Nadel [n].
  Danach kostet eine L1 je Bildpunkt so viel wie eine Karte, und das Gesetz darf den Tausch dorthin legen, wo die Zeile ihn verlangt —
  bezahlt in Ecken, nie in Licht. Ein Sonderfall bleibt wahr: nur Bäume unter 8 m (Eiche) bzw. 3,8 m (Weide) trügen ihre Karte vor dem
  Haushalt [r] — zu wenige für einen Schnitt.

## 2. DIE SCHNITTE (nacheinander im Baum `w28-baum-schirm`; der Preis-Schnitt zuerst, weil er jeden Bild-Schnitt danach bezahlt)

Für JEDES Bild und JEDE Messung: die Welt LEBT in 1920 × 1080 (`werkbank start --echt`), der Bericht nennt `r._schirm()` je Bild; Uhr 0,5,
identische Kamera auf beiden Seiten. Die vier Orte: **P1** Ankunft, Pose `bild:genesis` (Blick auf die Bäume) · **P2** Mess-Wiese
(−280, −1046) Ego mit der Baumreihe, dazu die Tafel-Pose laub-kante (−284 +1,7 −1042 → −269 34 −1036) · **P3** ein Baum ≥ 15 m hinter
Kronen-Masse in 30–35 m (`entry._occluded === true` auf main), Ausschnitt 400 × 400 px · **P4** offene Wiese, Ziel in 75 m, einmal 75°,
einmal `--fov 20`, dazu 120 m unter Tele. Bilder nach `artifacts/profiband/auge/w28-baum-schirm/`. Preis: A B B A in EINER Welt, Anteil
der Klasse je Durchgang (`werkbank zerlegen`), Referenzfahrt f ≤ 1,2, sonst „UNGEMESSEN unter Last“; VRAM und Heap nach zwei GC ≤ main.
Ein Schalter für A B B A lebt nur in der Werkbank-Sitzung (Lehre 20), nie im Stamm.

### Schnitt 1 — DER TIEFEN-VORLAUF: das Licht der maskierten Vegetation zahlt nur der vorderste Bildpunkt

**Wurzel.** 12,6–15,6 Karten-Lagen je Kronen-Pixel werden alpha-getestet, 4,4–8,5 bestehen den Test [n]; der frühe Tiefentest verwirft
nur, was HINTER schon geschriebener Tiefe liegt, und die Reihe im Befehl ist die des Netzes, nicht die des Auges. r184 setzt den
Ausschnitt als `discard` vor das Licht in den Programm-Text (`setupDiffuseColor`: maskNode zuerst, alphaTest danach [v]); ob ein
verworfenes Fragment das Licht trotzdem rechnet, entscheidet der Übersetzer — das liest niemand, das misst der Spike.
**Schnitt oder Umbau?** Im EINEN Stoff und EINEM Pass: nicht möglich — ein Programm mit `discard` und Tiefen-Schreiben bekommt kein
frühes Schreiben, r184 kennt keinen Vorlauf [v]. Ein Umbau der Zeichen-Folge an EINEM Chokepoint, ohne Vendor-Eingriff: jedes maskierte
Vegetations-Leaf zeichnet ZWEIMAL aus derselben Geometrie und demselben Instanz-Puffer — erst nur Tiefe (Stoff-Stufe ohne Licht: Lage,
`colorNode.a`, `maskNode`; `colorWrite` aus), dann die Farbe mit `depthWrite` aus. r184 trägt das: `depthWriteEnabled`/`depthCompare`
aus dem Stoff, `polygonOffset` → `depthBias` [v]. Die Tiefen-Stufe mit Ausschnitt gibt es im Vendor nur im Schatten-Pass
(`_getShadowNodes` liest `colorNode.a · map.a · maskShadowNode‖maskNode`, `renderObject` kopiert `positionNode · alphaTest · alphaMap`
[v]) — der Vorlauf ist KEIN Schatten-Pass: er liest `maskNode` (die Durchsicht der Kamera), nie `maskShadowNode`, und er ist ein
Objekt der Reihe, kein Override-Render (ein Bündel nimmt unter overrideMaterial nie auf, Lehre 23). r184 schreibt kein `@invariant`
an die Position [v]: Tiefen-Gleichheit zweier Programme ist nicht garantiert — die Farbe prüft `≤` mit Tiefen-Vorhalt, nicht `=`.
**Dateien.** stamm/siedlung-instanz.js (`_archInstanceGroupFor` :453, der Ort der Zwillings-Ebenen :505–506 · :546 · :642), stamm/stoff-karte.js:598–635
(Karten-Leaf, das Muster des Wurf-Zwillings), stamm/vegetation-wiese.js:884–918 (Senken der Ferne), stamm/siedlung-bauten.js:1844
(`_sharedFoliageMaterial`: die EINE Stelle, die die Tiefen-Stufe aus dem Stoff ableitet), stamm/bild-kosten.js:1291–1322 (`_buendelKinderReihe`,
`_zeichenRang`: der Vorlauf der Klasse steht vor jeder Farbe).
**Stirbt.** Das Tiefen-Schreiben im Licht-Programm der Klasse (jeder Stoff mit alphaTest aus stoff-material.js:1438 · :1743 · :1755 und
`_halmFerne`) und mit ihm die Abhängigkeit des Preises von der Reihenfolge. Sonst nichts — darum der Spike.
**Spike davor** (eine warme Welt, Werkbank, live getauscht; drei Fälle: P2 Baumreihe · P3 Kronen-Masse · P1 Ankunft): Vorlauf an/aus
A B B A. EINE Zahl: die Klasse (`baum` + `karten` + `nahWieseFern`) verliert an P2 **≥ 12,5 Anteils-Punkte** (heute 60,3 % = 15,9 ms; das
sind 3,3 ms bei 26,3 ms [s]) und wird in keinem Fall teurer; dabei hält der Dreiecks-Haushalt der Klasse (gate:profiband P zählt den
Vorlauf als eigenen Pass mit). Je Posten einzeln gelesen: wer nicht fällt (Erwartung: die Nadel-Arten mit 2 Alpha-Lagen, womöglich die
Karte), bekommt keinen Vorlauf. **Spike nein = der Schnitt fällt offen und benannt** (Messname „Anteil `baum` an der GPU-Zeit“,
29,6 % Radeon) — kein Erzwingen.
**Bildpaar.** P1–P4, alle gleich zu main: derselbe vorderste Bildpunkt gewinnt. **Annahme Bild:** Pixel über der Rausch-Schwelle 18
(`__bildRauschen`) Kandidat ↔ main ≤ zwei main-Schüsse derselben Pose; gate:pop ≤ 0,05 % (main Radeon 0,0487 %); laub-kante nicht über main.
**Annahme Preis:** die Spike-Zahl am gebauten Stand; `baum` allein ≤ 20 % (heute 29,6 %) [s]; VRAM ≤ main (kein neuer Puffer: Geometrie
und Instanzen sind geteilt), Heap ≤ main (neue Render-Objekte je Leaf — gemessen, nicht geglaubt).
**Leser-Liste.** Atlas-Bau (`_karteWeltBacken`/`_karteBuehne` zeichnet die L1 mit DEMSELBEN Stoff und liest ihre Tiefe je Texel — ohne
Vorlauf auf der Bühne backt die Karte falsch) · Werkstatt-Vorschau (werkstatt-vorschau.js:725 · :808–812) · See-Spiegel und jede zweite
Kamera der Ebene 0 · die Wurf-Ebene (der Vorlauf wirft nie, `_wurfEbene`) · Kontakt-Schatten und TRAA lesen die Tiefe des Bilds ·
die Diät und die Bündel (gate:kamera-treue) · der Zensus (`draw-zaehler`, `band-urteil.cjs` `erzeugerOf`, `zerlege-linse`: der Schalter
`baum` nimmt beide Züge) · gate:foundry-crossfade (9) (die Maske steht in BEIDEN Zügen) · Studio und Golden: keine Geometrie berührt.

### Schnitt 2 — DER BAUM LIEST SEINE ZEILE: die Stufe je Vorlage am Bildpunkt

**Dateien.** stamm/vegetation-streu.js (`LOD_SCHIRM.fehler.tree` :2892, `_stufenSchirm` :1922–1944, `_wechselGesetz` :2970–2979, die Kommentare
:2847–2848 und :2873–2874), stamm/siedlung-instanz.js:390–430 (`_lodSlotStamp`, der EINE Slot-Stempel), stamm/siedlung-bauten.js:390–421
(`_archStufeSpiel`), scripts/lib/kronen-linse.cjs (5) `wechselProbe`, scripts/diag-haus-fern.cjs (P).
**Was gebaut wird.** Die Tafel trägt je Baum-Vorlage [e₁, e₂], gemessen wie Haus und Tor (Station lod.K5, Kanten-Versatz zur L0); in
Einheiten der Tafel sind die heutigen Karten e₂ = Eiche 0,0046 · Birke 0,0049 · Karst 0,0074 · Fichte 0,0082 · Weide 0,0097 [r aus :2051–2053],
e₁ (L1 ↔ L0) ist UNGEMESSEN. Die Zeile wirkt je Instanz als WERT im Slot-Stempel: Stufen-Höhe = Sichthöhe × k, k = max(e·f(Zeilen)/Haushalt, 1)
— genau das Gesetz, der Pixel-Term ohne Klammer, die Klammer am Haushalt [r]. Die Formel der Maske bleibt byte-gleich dem Kern
(phyto-core `lodCrossfadeMask`, stoff-karte.js:138–230); `uLodD0`/`uLodD1` bleiben der Haushalt je Art. Der Wind liest `aH0` als WAHRE
Höhe (stoff-instanz.js:265), `_kronenOben` die Sichthöhe (vegetation-streu.js:1984–1988): Stufen-Höhe und wahre Höhe werden getrennt — in den
Feldern, die nur die Maske liest (`|aH0L|`, `aKarte.w`), ohne neues Attribut (8 Vertex-Puffer sind die Grenze, stoff-karte.js:517–518).
Ein Wechsel der Zeilen stempelt die lebenden Slots neu (Kosten an Änderung; die Epoche `_baumEpoche` :1939 trägt ihn).
**Stirbt.** `tree: je({})` (:2892) · der Ruf ohne Vorlage für die Art Baum (:1929–1930; ein Baum ohne Zeile ist KERN-PFLICHT-Bruch wie
das Haus, :2975–2976) · der Satz „DER BAUM trägt keine Zeile“ (:2873) und die Behauptung von :2847. Die Quelle der Karte BLEIBT die
L1 (`_karteStufe`, stoff-karte.js:432): „Backen aus L0“ ist für diese Welle gestrichen — die Laub-L1 trägt seit w10 die Krone der L0
[n: Lagen gleich], der L0-Bau läge auf dem Pfad der Ankunft, die Texel-Grenze bliebe; wie wahr eine Karte ist, sagt ihre Zeile.
**Spike davor** (EINE Welt, P2, nach Schnitt 1; die Schwellen live gestellt wie `werkbank licht --laub --karte`; drei Fälle: thresh12 ×
1,5 · × 2,5 · × 3,16): EINE Zahl: Dreiecke der Klasse `baum` je Pass ≤ Ratsche (`spec/profiband/ratsche-wiese-radeon-ego.json`) — dazu
gelesen CPU-Takt p95 und Anteil der Klasse. Hält die Ratsche bei × 1,5, wird gebaut; jede Vorlage, deren Zeile sie reißt, steht ROT beim
Namen mit ihrer px-Zahl, geheilt wird an ihrer Karte, nie an Schwelle oder Band. Hält sie schon × 1,5 nicht: **Spike nein = offen und
benannt** (Messname lod.K5 „Kanten-Versatz Karte ↔ L0 je Vorlage“, 1,50–3,16 px).
**Bildpaar.** P2 (Baumreihe im Gang durch das Band 18–26 m, je Art ein Paar L1 ↔ Karte am Tausch) und P1. **Annahme Bild:** Kanten-
Versatz am Tausch ≤ 1,0 px je Vorlage (GPU, 16 Peilungen, 1080 Zeilen; heute 1,50–3,16) [s = `LOD_SCHIRM.px`]; gate:pop ≤ 0,05 %.
**Annahme Preis:** Anteil `baum` + `karten` ≤ Stand nach Schnitt 1 + 1 Punkt [s]; Dreiecke ≤ Ratsche; CPU-Takt p95 ≤ main; VRAM, Heap ≤ main.
**Leser-Liste.** `_chooseLODForDistance` · `_archStufeSpiel` · die Band-Pflege (`_lodBandPartnerFor`, `_updateFoundryLodBand`) · das Fenster
der Instanz-Wahl (`_blendeK`, bild-kosten.js:2815–2835) · der Wurf der Karten im Lichtmesser (stoff-karte.js:697–712) · der Kalt-Schätzer
`_foundryLodForEntry` · `werkbank licht --laub --karte` · Station lod.K5 · gate:foundry-crossfade · gate:schirm-monotonie · Studio: die
Distanzen d0/d1 bleiben die des Labors · Ofen, Atlas-Bau, Golden: unberührt.

### Schnitt 3 — DIE VERDECKUNG IN METERN STIRBT: der Baum hinter der Krone wählt wie jeder Baum

**Wurzel.** `OCCLUSION.occDist` 30 m ist ein Preis-Schalter aus der Zeit, als jede verdeckte Lage Licht zahlte. Nach Schnitt 1 zahlt
ein verdecktes Fragment kein Licht; der Schalter zeigt dafür Karten bei 352 px (15-m-Baum) bis 469 px (20 m) durch jede Lücke [r].
**Dateien · stirbt.** stamm/siedlung-bauten.js: `_rebuildOcclusionGrid` · `_maybeRebuildOcclusionGrid` · `_occlusionOccludes` (:74–134), `occlOn`
(:152), der Rand im Spielraum (:393–395), die Demotion (:505–531), `AnazhRealm.OCCLUSION` (:3374–3392); stamm/siedlung-instanz.js:
`_lodSlotOcclusionRefresh` (:434–443) und der Zweig `_occluded` in `_lodSlotVoll` (:448–452; Brücke und Halt bleiben); `occlNode` der
Karten-Maske (stoff-karte.js:183–185, stoff-material.js:1383–1385); `useOcclusionDemotion` (dirigent-kern.js:832, dirigent-takt.js:2233,
scripts/diag-stand-takt.cjs:1459).
**Spike davor** (der Schalter lebt schon: `state.useOcclusionDemotion = false`; EINE Welt nach Schnitt 1; drei Fälle P3 · P2 · P1):
EINE Zahl: Anteil `baum` + `karten` ohne Gitter ≤ mit Gitter + 1 Punkt [s], Dreiecke ≤ Ratsche. **Spike nein = occDist bleibt, offen
und benannt mit beiden Zahlen.** Ohne Schnitt 1 wird dieser Schnitt nicht gebaut.
**Bildpaar.** P3. **Annahme Bild:** Bäume, die im Bild als Karte über der Bild-Höhe ihres Gesetzes stehen: 0 (main: jeder verdeckte Baum
≥ 13,8 m zwischen 30 m und seiner Grenze [r]); gate:pop ≤ 0,05 %. **Annahme Preis:** die Spike-Zahl; CPU-Takt nicht über main (das
Gitter und sein Marsch je Takt fallen weg).
**Leser-Liste.** `_archStufeUrteil` · `_stufenWache` (der Spielraum) · die Stand-Wache (dirigent-takt.js:2233) · der Kern-Term vOcc in
`lodCrossfadeMask` (bleibt im Kern, die Welt reicht 0) · gate:foundry-crossfade · Playtest-Invarianten der Verdeckung.

### Schnitt 4 — EIN TON DER FERNE: Grund und Büschel der Wiese lesen dieselbe Blende

**Wurzel (Verdacht).** Jenseits 40,5 m trägt die Zahl die Deckung nicht mehr (D 0,29 bei 75 m). Der Grund trägt den Rest als Ton —
bis 80 m den Ton der besonnten Krone, über 80–160 m zurück zum Bestand (stamm/stoff-material.js:3197–3204 [q]) —, das Büschel der Ferne
(`_halmFerne`, stamm/stoff-material.js:63–115) liest diese Blende NICHT: zwischen 80 und 186 m stehen helle Büschel (D 0,25 → 0,05) auf
dunkelndem Grund. Am Ruhe-Schirm deckt der Ein-Pixel-Halm es zu (10,7 cm bei 75 m), unter dem Tele nicht (2,4 cm) [r].
**Dateien.** stamm/stoff-material.js (:3188–3212 Grund, :63–115 `_halmFerne`), stamm/vegetation-wiese.js (`_wieseFern` :577–587 als Heim der EINEN
Blende, neben Anteil und Größe), scripts/diag-profiband.cjs (`ferneWand` :299–321).
**Stirbt.** Die Blende als Hand-Rechnung im Boden-Stoff (:3197–3204: `_camW`, 0,5 · radius, 0,4 · bis, 0,8 · bis) — sie wird ein Glied des
Gesetzes `_wieseFern` über derselben Algebra, und ZWEI Leser lesen sie: Grund und Büschel. Der Ring der Chunks (172,8 m) bleibt ihr Ende:
er ist ein Ort der Welt, kein Stufen-Schalter. Die Zahl (`fuss`, Kappe) bleibt unberührt — bei 1080 Zeilen brächte ihr Umzug auf Zeilen
nichts, bei 360 Zeilen bewegte er jede kleine Linse (§4).
**Spike davor** (Werkbank, der Stoff der Ferne live; drei Fälle: P4 bei 75° · P4 Tele 75 m · Tele 120 m): EINE Zahl: Ton-Schritt =
Median-Luma der Klasse `nahWiese:Lf` ÷ Median-Luma des Bodens im Band 80–160 m, Soll **0,92–1,08** [s, das Band der Bild-Tafel D0]; main
zuerst messen (Erwartung: über 1,08, wachsend mit dem Abstand). Liegt main schon im Band, ist die Wurzel eine andere (die ZAHL je Bildpunkt
unter Tele, 18,9-mal weniger [r]): **Spike nein = der Schnitt fällt offen und benannt.**
**Bildpaar.** P4 (75° und Tele) und 120 m Tele. **Annahme Bild:** Ton-Schritt 0,92–1,08 bei beiden Sichtfeldern; Boden-Anteil 40–80 m
und 80–200 m nicht über main (Abgabe 0b303b08: 2,3 % · 48,9 % [k]); gate:nah-fern GRÜN (Albedo Boden-Satz gegen Fern-Ring).
**Annahme Preis:** Anteil `nahWieseFern` ≤ main (10,2 %), Lf-Dreiecke ≤ Ratsche; VRAM, Heap ≤ main.
**Leser-Liste.** der Boden-Stoff · `_halmFerne` · die WGSL-Form (`WIESE_WGSL` :592–602, nur wenn die Wahl das neue Glied liest) ·
die Farb-Tafel des Wiesen-Bodens und `FERN_FARBE.halmSchatten` (daten.js:554–580) · `_fernRingTeile` und `werkbank albedo --nah-fern` · `ferneWand` · die
Soll-Tafel der Wiese (vegetation.K1). Ofen, Atlas-Bau, Studio, Golden: unberührt.

## 3. DER RICHTER (bestehende Familien; vorher ROT am Täter)

| Linse (Familie) | Messgröße | Schwelle | Mutanten | vorher ROT, erwartete Zahl |
|---|---|---|---|---|
| gate:profiband, Zensus der Befehle (`draw-zaehler`, `band-urteil.cjs`) — Schnitt 1 | jeder gezeichnete maskierte Vegetations-Stoff: Farbe ohne Tiefen-Schreiben UND ein Tiefen-Zug derselben Geometrie davor | 0 Täter | ein Laub-Stoff, der in der Farbe Tiefe schreibt; ein Vorlauf, der wirft; ein Vorlauf ohne `maskNode` | jeder Laub-, Karten- und Ferne-Stoff von main beim Namen (`_laubLichtStoff` „laub“ · „atlas“ · „karte“, `_halmFerne`) |
| gate:asset-contract (L) — Schnitt 1, die Zahl dahinter | Quad- und Alpha-Lagen je Kronen-Pixel | Budget 16 (bleibt) | steht (verdreifachte Karten) | kein ROT: sie nennt, was der Vorlauf einspart (Alpha 8,5 → 1) |
| gate:haus-fern (P), `wechselProbe` um die Bäume erweitert — Schnitt 2 | Kanten-Versatz jeder gezeigten Stufe zur L0 an der Grenze, die das Gesetz aus IHRER Zeile legt | ≤ 1 px | die Zeile halbiert (der Tausch kommt zu früh); die leere Tafel; der Stempel ohne k | Weide 3,16 · Fichte 2,66 · Karst 2,41 · Birke 1,58 · Eiche 1,50 px am Haushalt 26 m |
| gate:schirm-monotonie — Schnitt 2 | Tausch-Abstand der Baum-Stufen je Fenstergröße | folgt den Zeilen, sobald der Pixel-Term bindet | `_stufenSchirm` ohne Zeilen | thresh12 = 26 m bei 360, 1080 und 2160 Zeilen |
| gate:foundry-crossfade — Schnitte 1–3 | Maske = `lodCrossfadeMask`, in jedem Zug dieselbe | byte-gleich | Vorlauf mit anderer Blende; `occlNode` lebt noch | (9) feuert am Vorlauf ohne Maske |
| gate:pop (lod.K2#1) — Schnitte 1–3 | Pop-Pixel je Sekunde im 4-m-Gang, 1920 × 1080 | ≤ 0,05 % | steht | kein ROT erwartet (main Radeon 0,0487 %): die Wand gegen den Rückfall |
| gate:laub-kante (lod.K1#1) — Schnitte 2–3 | Kante der Klasse `fimp:atlas:L2` an der Tafel-Pose | ≤ 0,22 | steht (Rinde der Karte) | 0,2635 (PFLICHT-OFFEN A) — erst wahr, wenn die Tafel-Pose in einer 1080-Welt entsteht (w28-probe-schirm) |
| gate:profiband P-Ferne, `ferneWand` — Schnitt 4 | Ton-Paar: Blende des Büschels − Blende des Grunds an jeder Stütze von `radius` bis `bis − saum`; D über die ganze Ferne als Lesewert (heute blind jenseits `skalaMax`, :319) | Δ ≤ 0,02 | das Büschel ohne Blende; die Blende als Hand-Rechnung im Boden-Stoff | Δ = 1,0 bei 160 m (Büschel 1, Grund 0) |

Zeit urteilt nur auf einem Band-Gerät (`zeit:gate:`), relativ zur Referenzfahrt; keine Ratsche steigt.

## 4. AUSSER SCOPE — benannt mit Messnamen

- **Die Kamm-Krone** (stamm/gelaende-fern.js:533–540, Ellipse/Kegel von Hand; gehört dem Preis-Schwarm): Messname „Kanten-Versatz Kamm-Krone ↔
  Karte am Horizont 384 m“; Kosten 1,1 ms (< 2σ, befund-gpu).
- **Die Menge der Bewohner** (`mengePx` 64 ohne gemessenen Fehler, 40 000 → 1 700 Dreiecke): Messname „Kanten-Versatz Mengen-Leib ↔ L0 bei 64 px“.
- **Die Zelle des Atlas 128 × 256** (foundry-core.js:788): mehr Texel hieße VRAM über main; Messname „Texel-Grenze der Karte“, Weide 1,7 px.
- **Der feste Preis der Karte** (5,4 ms Wiese · 6,7 ms Spawn, „folgt den Pixeln kaum“): fällt er im Spike von Schnitt 1 nicht, bleibt er stehen;
  Messname `werkbank zerlegen`, `fimp:atlas:L2` gegen `fimp:atlas:L2#S` (Bild gegen Wurf-Zwilling).
- **Das Tele in jedem Stufen-Gesetz und die Zahl der Wiese je Bildpunkt** (`_brennweite` fest 75°, vegetation-streu.js:2982–2986; `fuss` in
  Metern): unter fov 20° 18,9-mal weniger Büschel je Pixel; die Kandidaten dafür lägen ~4,9-fach in den Kacheln [r] — Heap und VRAM über
  main. Messname „Büschel je Bildpunkt bei 75 m unter fov 20°“.
- **Die übrigen Meter-Schalter** der Tafel (befund-stufen): Strauch/Wagen 12/26 m, Laub-Rand 70–240 m, Horizont 384 m, Schatten 170 m,
  Leib 40 m, Tier 35 m, Nah-Streu, Boden, Ringe — diese Welle trägt Baum und ferne Wiese.
- **stamm/studio-gestalt.js, die Kaskaden, stamm/dirigent-takt.js, die Render-Objekte der Kamm-Krone**: Baum `w28-preis-ort` — nicht berührt.
  Vorsicht an EINER Stelle: der Preis-Schwarm zieht die Stempel `aLodLevel · aH0 · aH0L` „je Gestalt statt je Ecke“ um
  (ENTSCHEID Schnitt 1.4); Schnitt 2 ändert nur WERTE im Slot-Stempel, nie das Format — vor dem Bau gegen ihren Kopf lesen.

## 5. EHRLICH OFFEN — was nur die GPU klärt

1. Ob der Vorlauf spart: wie Dawn/D3D12 ein `discard` vor dem Licht rechnet, ob der frühe Test bei abgeschaltetem Tiefen-Schreiben auf
   beiden Geräten greift, und ob `≤` mit Vorhalt ohne `@invariant` lochfrei bleibt. Die Lagen sind gemessen [n], die Millisekunden nicht.
2. Der Dreiecks-Haushalt unter dem Vorlauf (die Ecken der Klasse laufen zweimal) und der Heap der zusätzlichen Render-Objekte.
3. Welcher Teil der Karte die 5,4 ms trägt (Hauptbild, Ecken-Tiefe, Wurf in k0–k2) — und die Zahl „79 % an den Pixeln“ selbst: die
   960er Reihe zeichnete die Wahl der 1080-Welt (befund-linse).
4. Was das Gesetz an L1-Bäumen wirklich hinausschiebt: e₁ ist ungemessen, die fünf e₂ stammen aus EINER Pose am CPU-Modell; die
   Dichte der Baumreihe an P2 und der CPU-Takt entscheiden (20/40 kostete einst 8,4 ms Frame bei +0,33 ms GPU [k]).
5. Der Ton-Schritt der Wiese auf main — ob die Wurzel von Schnitt 4 überhaupt der Ton ist.
6. Alles an der GTX 1060: jede Zahl dieses Blatts stammt von der Radeon oder aus Node.
7. Die Rechnung des Preises: erreichbar scheint p95 25,0 ms (≥ 3,3 ms aus Schnitt 1); p95 16,7 ms (≥ 11,6 ms) erreicht diese Welle
   NICHT, solange der feste Preis der Karte steht.

Geschnitten: nichts gebaut — vier Schnitte entschieden, die These an der Quelle widerlegt und ersetzt.
Gemessen: 12,6–15,6 Quad-Lagen und 4,4–8,5 Alpha-Lagen je Kronen-Pixel am Laub, L1 = L0 (Node, main 68d24688).
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md).
Status: ZWISCHENSTAND
