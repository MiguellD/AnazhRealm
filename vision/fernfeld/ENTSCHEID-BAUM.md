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

## Zusatz des Koordinators (15.11. 00:43, Z1 berichtigt 00:54 — bindend für jeden Bauer, Gegner und Heiler dieser Welle; geht dem Text oben vor)

**Z1 — Schnitt 1 bleibt gefallen; Schnitt 3 hängt nicht mehr an ihm.** (Berichtigt 00:54: meine erste Fassung von 00:43 wollte den
Vorlauf als „1b“ zurückholen. Sie las die Kurz-Probe `kurz-abba-laub.json` — 28,1 ± 10,8 Punkte —, die der Bauer selbst als ungültig
markiert hat (neben dem echt-Job, unter Last). Zurückgenommen; es gilt seine Messung.) Der Spike von Schnitt 1
(`vision/fernfeld/bericht-baum-schnitt1.md`, Radeon, Welt 1920 × 1080, A B B A über fünf Durchgänge): P2 alle 5,3 ± 3,7 Punkte gespart
(Soll ≥ 12,5) · nur Laub 4,9 ± 4,9 · nur Blatt-Karte 8,5 ± 5,1 · nur Karte L2 −7,2 ± 1,6 (teurer) · P1 Ankunft −17,5 ± 4,4 (teurer);
Dreiecke `baum` 173 320 > 150 000, auch L0 allein (151 028) und L1 allein (154 536). **Spike nein — der Schnitt steht OFFEN**, Messname
„Anteil `baum` an der GPU-Zeit“ (29,6 % Radeon). Kein 1b, kein Teil-Vorlauf: ein Gewinn von 5–13 Punkten mit dieser Streuung trägt
keinen zweiten Pass.
- *Was der Spike dafür gezeigt hat:* der frühe Tiefentest verwirft die hinteren Lagen schon (`_buendelKinderReihe` zeichnet vorn
  zuerst) — der Preis des Laubs liegt NICHT im Licht verdeckter Lagen. Wo er liegt (Hauptbild ↔ Wurf-Kaskaden, Ecken ↔ Bildpunkte),
  ist UNGEMESSEN und nicht Teil dieser Welle.
- *Folge für Schnitt 3:* seine Wurzel hieß „occDist ist ein Preis-Schalter aus der Zeit, als jede verdeckte Lage Licht zahlte“. Zahlt
  sie es schon heute nicht, braucht Schnitt 3 Schnitt 1 nicht. Der Satz „ohne Schnitt 1 wird dieser Schnitt nicht gebaut“ ist
  gestrichen: **der Spike von Schnitt 3 läuft** (der Schalter lebt: `state.useOcclusionDemotion = false`), seine Zahl entscheidet wie
  geschrieben. P3 liegt nicht an der Mess-Wiese (dort steht kein `_occluded`-Baum ≥ 15 m): der Bauer sucht den Ort über den Zensus
  `entry._occluded === true` (Wald, Baumgruppe an der Ankunft) und nennt ihn mit Koordinate.
- *Folge für Schnitt 2:* sein Spike misst auf dem Stand von main (kein Vorlauf); die Zahl (Dreiecke ≤ Ratsche bei × 1,5) entscheidet.
- *Messung der Zeit für alle:* A B B A B A A B in EINER Welt (acht Durchgänge), Standardfehler des Medians im Bericht; liegt er über
  4 Anteils-Punkten, heißt die Zahl „UNGEMESSEN unter Last“ und wird wiederholt, sobald das Schloss frei ist — nie auf Ruhe warten,
  nie Ruhe erzwingen. Dateien einer Probe, die nicht zählt, tragen das im Namen UND in der Datei („zaehlt-nicht“), damit sie niemand
  als Messung liest.

**Z2 — der Pop ist neu geeicht.** Fund der GTX 1050 (FUND-REGISTER 15.11. 00:30, Abgabe `w28-probe-schirm` 68df6ac0): die gebuchten
0,0487 % (Radeon) und 0,051 % (GTX) maßen eine Welt, deren Stufen-Wahl bei 360 Zeilen stand. In der Welt, die ab dem Boot in
1920 × 1080 lebt, misst `gate:pop` an der Mess-Wiese auf main **1,63–1,72 % Pop-Pixel/s** (33 838 px; je 4-m-Schritt +44 bis +96
Karten-Dinge erstmals gezeichnet in 100–155 m). Damit gilt in JEDEM Schnitt dieser Welle statt „gate:pop ≤ 0,05 %“: **Pop des
Kandidaten ≤ Pop von main, beide in derselben Art Welt gemessen (ab dem Boot 1920 × 1080: `WERKBANK_FENSTER=1920x1080` oder `--echt`),
A ↔ B in derselben Sitzung oder zwei Sitzungen mit Referenzfahrt.** Die Schwelle 0,05 % der Linse bleibt stehen und ist ROT — sie ist
das Ziel von Schnitt 5, nicht eure Annahme.

**Z3 — Schnitt 5, DER EINTRITT (neu): nichts erscheint größer als ein Bildpunkt.** Der Pop gehört in diese Welle: was in 100–155 m
erstmals zeichnet, ist ein Stufen-Wechsel „nichts → Karte“ ohne gemessenen Fehler — ein 10-m-Baum steht dort 47–70 px hoch [r] und ist
im nächsten Bild einfach da. Gesetz (1) gilt auch für die erste Stufe: ein Ding tritt ein, wenn sein Fehler gegen „nichts“ (seine
Bild-Höhe) einen Bildpunkt trägt, oder es blendet über die Maske des Kerns ein, die jeder andere Wechsel liest. Der Täter ist
UNGELESEN: zuerst der Befund `vision/fernfeld/befund-pop.md` (wer zeichnet dort erstmals, welches Gesetz legt seinen Horizont, warum
folgt die Zahl den Zeilen), dann der Bau auf meinem Entscheid darunter. Annahme: `gate:pop` an der Mess-Wiese in der 1080-Welt
≤ 0,05 % ODER, wenn der Befund eine Wurzel außerhalb der Vegetation nennt, die gemessene Zahl mit Täter beim Namen und Messnamen.

**Z4 — der Stand.** main steht auf 11d8de3d (w28-auge, w28-satz-wand-ruhe gelandet), `w28-probe-schirm` 68df6ac0 fährt als nächste
Abgabe (stamm/dirigent-takt.js `_weltSteht`, `werkbank start --fenster BxH`, `gate:schirm-stufen`). Jeder Bauer mischt vor seinem
ersten Bild `origin/main` in den Zweig (Merge-Commit, kein Rebase) und nennt den main-Kopf im Bericht.

## Z5 — ENTSCHEID POP (Schnitt 5, der Eintritt) — ZWISCHENSTAND

Stand 15.11.2026 02:04 (date). Gelesen: `befund-pop.md` mit `pop-roh/` und den Akten seines Laufs, die vier GTX-Rohzeilen
(`probe-post/w28-probe-schirm/pop-roh/`), die Quelle an jeder Datei:Zeile — der Stamm im Lese-Baum 11d8de3d (am main-Kopf 01a6714a
byte-gleich), `scripts/` und stamm/dirigent-takt.js am main-Kopf. Kein Bau, keine GPU. **[m]** hier: im Befund gemessen.

| Aussage des Befunds | Die Quelle | Folge |
|---|---|---|
| Täter: die Saat der Wald-Ringe 3–4 nach dem „steht“, Laub-Rand 129,6 → 216 m im Gang, 1,6257 % | hält [m]: `laubA` 149,6 · 177,1 · 212,1 · 216 m je Schritt, Einträge 1 547 → 2 483. Die Rohdatei trägt 483 neu gepflanzte von 488 (277 Bäume, 107–206 m, 21–232 px, Median 66), nicht „547 von 554“ | der Täter steht, die Zählung im Text nicht |
| Wurzel „Ring-Rampe ab Ring 2“ — **geraten** | der Ring stand am Ziel: `umstellen` zwingt `_activeRingRadius` aufs Ziel und wartet auf den gebauten Ring (scripts/werkbank.cjs:750–768 [q]); die Akte des Laufs meldet 81 Chunks = Ring 4 [m]. Zurück lag NUR der Laub-Rand | der Vorschlag (Ring 4 samt Wald vor das erste Weltbild) zahlt die Ankunft — 25 → 81 Chunks, B steht bei 16,6 s — für einen Täter, der woanders sitzt: **verworfen** |
| „warum die 360-Welt ihren Wald trug und die 1080-Welt nicht: ungemessen“ | es steht in der Quelle [gelesen, nicht gemessen — Fall 1 gegen Fall 3 misst es]: `state.foliageRadius` hat EINEN Schreiber, den Aktuator des PID (stamm/dirigent-regler.js:328, :376), gerufen nur aus `_nexusPerfRegulate` (:262), das bei `perfRegulator === false` vor ihm endet (:238). Wer auf „steht“ wartet, hält den Regler (scripts/lib/welt-boot.cjs:306–310). Seit w28-probe-schirm baut `/fenster` die Welt unter diesem Warten (werkbank.cjs:1860–1866; das Tor ruft es vor `umstellen`, :3198): 2 302 Takte ab 1 Chunk [m], der Ring wächst regler-frei auf 4 (`_ringWaechst`), der Laub-Rand bleibt am Wert des Lade-Takts, 129,6 m. Davor tickte `/fenster` nicht, die Welt entstand in `__gebautNach` bei laufendem Regler unter dem Lade-Takt — Laub-Rand sofort 216 (:376) | nicht 360 gegen 1080 Zeilen: die GTX-Zeile „lebt in 640 × 360, neues `/fenster`“ trägt 1,6318 %, die mit altem 0,0565 % [q]. **Z2 ordnet falsch zu:** 1,63–1,72 % misst den Wald, den der Gang nachsät, nicht die Stufen-Wahl einer 1080-Welt |
| die Blende ist `aEin` über 32 Takte, nicht die Maske des Kerns | stimmt (stamm/stoff-material.js:1395–1407 [q]); die Distanz-Blende ins Nichts fiel zweimal als Geist (:1368–1370, :1391–1393 [k]) | „über die EINE Maske des Kerns“ ist für nichts → Karte ohne Träger nicht baubar |
| Lücke Laub-Rand → 384 m, die Kamm-Krone beginnt erst dort | stimmt (stamm/gelaende-fern.js:552, :1704, :1755–1766 [q]) | der Träger liegt in der Datei des Preis-Schwarms |

**Die Wurzel.** Der Laub-Rand ist EXISTENZ (dirigent-regler.js:265–268 sagt es selbst, Lehre 13), sein einziger Schreiber aber der
Regler: ruht der, steht der Wald am Boot-Wert, während Ring und Boden am Ziel stehen. Am Ring fiel dieselbe Klasse schon („gar nicht
bei ruhendem Regler — die Mess-Wiese mit Ring 2 von 4“, stamm/gelaende-boden.js:2877–2879); der Laub-Rand blieb zurück, :2885–2886
(„er folgt dem Ring und steht mit ihm“) ist unwahr, und der Messort buehne klebt ein Pflaster darauf (`stell.foliageRadius` 240,
spec/profiband/haushalt.json:220). Im Spiel läuft der Regler, der Rand folgt dem Ring binnen 17 Bildern je Schale [r]: die 1,63 %
sieht nur der Richter — an einer echten Bruchstelle des Stamms.

**DER SCHNITT (EINER): der Laub-Rand ist eine Funktion des Rings, kein Zustand des Reglers.** `_laubRand()` gibt das ZIEL zurück, das
der Aktuator heute anfährt — min(`_randSchirm("laub")`, (aktiver Ring + 1) × span), dirigent-regler.js:333–343 — bei jedem Stand des
Reglers und ohne Müll je Ruf (der Eintritt fragt ihn je ungezeichnetem Wurf, stamm/studio-bruecke.js:3427). Unter dem Lade-Takt ist
das der Wert von heute (Ring 2 → 129,6 m): erstes Weltbild und Ankunft bleiben, wie sie sind.
**Stirbt:** `state.foliageRadius` als Zustand mit seinen zwei Schreibern (dirigent-regler.js:328, :376) und dem Wachs-Zweig (:332–345,
:372–376) · `PERF_FOLIAGE_GROW_STEP` (:1987) · `PERF_FOLIAGE_RADIUS_MIN` als Start (:1985, :344, :1114; :389 behält sein Verhältnis
als Zahl der Dichte) · der Sonderfall des Null-Renderers für das Laub (:328; headless steht der Ring am Ziel) · der Pin
`stell.foliageRadius` (haushalt.json:220, werkbank.cjs:682) · der Zustands-Leser im Schlaf des Wuchses (stamm/gelaende-chunks.js:1073,
:1103). Die Wand der Dichte (:346–371, :378–392) bleibt, sie ist Qualität. Kein Schalter, kein Rückfall. **Nicht berührt:**
stamm/gelaende-fern.js (:1704 liest nur), stamm/dirigent-takt.js (:2230 liest nur), stamm/studio-gestalt.js, die Kaskaden.
**Spike davor** (Radeon, Werkbank, Welt ab Boot 1920 × 1080, main ≥ 01a6714a, Ablauf des Tors `/fenster` → `umstellen --ort wiese
--sicht ego` → `pop`; je Fall `r._schirm()` und `_laubRand()` VOR dem Gang). **Fall 1** main, wie es steht (Erwartung 129,6 m und
1,6–1,7 %). **Fall 2** dieselbe Welt, der Gang ein zweites Mal — der Wald ist gesät, die untere Schranke ohne Eintritt. **Fall 3**
frische Welt, `_laubRand` VOR `/fenster` live auf das Ziel getauscht (Lehre 20): der Zustand des Schnitts. EINE Zahl: Pop-Pixel/s in
Fall 3, **≤ 0,0565 %** [q: main mit stehendem Wald, GTX] bei Laub-Rand 216,0 m vor dem Gang → gebaut. **Spike nein** (Fall 3 darüber,
oder Fall 1 trägt schon 216 m) **= offen und benannt**: „Laub-Rand vor dem Gang“, „neu gepflanzt je Schritt“ (`pop-roh/pop-namen.js`).
**Annahme Bild.** `gate:pop`, Mess-Wiese, Welt ab Boot 1920 × 1080: **≤ 0,05 %** (die Schwelle der Linse bleibt), in jedem Fall
≤ 0,0565 % und ≤ main (Z2); `_laubRand()` vor dem Gang 216,0 m mit UND ohne `/fenster`; neu gepflanzt je Schritt ≤ 2, keiner diesseits
184 m (main: 16–87 ab 107 m [m]). Bildfolge nach `artifacts/profiband/auge/w28-baum-schirm/schnitt5/`: die acht B-Schüsse des Gangs
main ↔ Kandidat, dazu das Differenzbild der zwei schwersten Schritte (main 5 765 · 16 390 Pop-Pixel [m]). Liegt der gebaute Stand in
0,05–0,0565 %, landet der Schnitt als Wahrheit des Richters, die Linse bleibt ROT beim Namen (Saum-Eintritt), Schnitt 5 heißt NICHT erfüllt.
**Annahme Preis.** Kein Dauerzustand ändert sich: Kandidat ≡ main mit Laub-Rand am Ring (in der Sitzung gestellt) in Einträgen,
Karten-Instanzen, Dreiecken, Befehlen (Differenz 0; GTX im Stand 98–99 Befehle, 379–390 k Dreiecke [q]); VRAM und Heap nach zwei GC,
CPU-Takt p95 ≤ main; EIN `werkbank zerlegen` als Lesewert (Anteil `baum` + `karten` ≤ main + 1 Punkt [s]); t(Weltbild) kalt wie main
(Kosten-Zeile). Gegen die Welt, die die Linse bisher sah (129,6 m), stehen +936 Einträge [m] und +30 k Dreiecke [q] — reißt damit
eine Ratsche, war sie an der verkürzten Welt gebucht: beide Zahlen an den Koordinator, keine Ratsche steigt.
**Richter (bestehende Familien, vorher ROT am Täter).** `gate:pop`: `popGang` nennt den Laub-Rand am START (heute nur am Ende,
werkbank.cjs:443) und trennt „neu gepflanzt“ von „eingetreten“ (:434 zählt beides als `ein`); ROT beim Namen, wenn er unter der
Ring-Kante liegt — main 129,6 ≠ 216. `gate:stand-takt`: „steht unter gehaltenem Regler ⇒ Laub-Rand = Ring-Kante“, Mutant der Wachs-Zweig.
**Leser-Liste.** `_foliageChunkInRadius` · `_tickFoliageGrowth` · `_archKartenHorizont` · der Cull-Gang (stamm/vegetation-baum.js:2734)
· `_streuRegionInReichweite` (stamm/vegetation-streu.js:1584) · `_fernKroneNahTakt` · der Stand-Stempel · `_weltbildLuecken`
(stamm/dirigent-ankunft.js:1275) · Telemetrie (dirigent-regler.js:1299, :1583; scripts/lib/zerlege-linse.cjs:804) · Playtest
(scripts/playtest/dirigent.cjs:223, :1342–1410, :1664; vegetation.cjs:24–26, :110) · scripts/diag-stand-takt.cjs:2150 ·
scripts/diag-fernwald.cjs:548 · gate:ankunft · der Messort buehne (240 → 216 m: Band vorher ↔ nachher) · der Null-Renderer (heute 240 m).

**Was dieser Schnitt NICHT wahr macht — offen, mit Messnamen.**
1. **Gesetz (1) an der ersten Stufe selbst.** Unter Bewegung tritt weiter etwa eine Karte je Schritt im Saum 184–216 m ein, ein
   15-m-Baum 49–57 px hoch [r], über `aEin` — kein Fehler unter einem Bildpunkt, keine Maske des Kerns. Wahr wird es nur mit einem
   Träger, der den Umriss zwischen Laub-Rand und 384 m schon zeichnet: stamm/gelaende-fern.js (Preis-Schwarm), größer als ein Schnitt —
   **eigene Welle.** Messnamen: lod.K2#1 im Stand 0,0487 % (Radeon) · 0,051–0,0565 % (GTX) gegen 0,05; „Bild-Höhe beim Eintritt“ gegen 1 px.
2. **Die Ankunft.** Nach dem ersten Weltbild wächst der Ring 2 → 4, der Wald 130–216 m tritt binnen Sekunden ein (Karten bis 232 px
   [m]); der Vorschlag des Befunds legte das unter den Ladeschirm und zahlte mit B. Messname „Pop-Pixel/s in den 10 s nach dem ersten
   Weltbild“, ungemessen — der Bauer schießt die Folge einmal in `--echt` als Lesewert, main ↔ Kandidat (Erwartung: gleich).
3. **Für jeden Bauer dieser Welle, bis Schnitt 5 in main steht:** eine Welt, die unter `__weltStehtNach` entstand (`/fenster` seit
   68df6ac0), trägt den Wald nur bis 129,6 m — jeder Bericht nennt `r._laubRand()` neben `r._schirm()`. Die Pop-Annahme von Z2 misst
   bis dahin über einem Boden von 1,63–1,72 % (Streuung 0,09 Punkte [q]) und sieht keinen Unterschied von 0,05: Schnitt 5 wird VOR
   den Pop-Annahmen der Schnitte 2–4 gebaut.

Geschnitten: nichts gebaut — EIN Schnitt entschieden, die Wurzel des Befunds an der Quelle berichtigt (der Regler, nicht der Ring), sein Vorschlag verworfen.
Gemessen: nichts Eigenes; gelesen 1,6257 % (Radeon) und 0,0565 ↔ 1,6318 % (GTX, 360-Welt, altes ↔ neues `/fenster`).
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md).
Status: ZWISCHENSTAND
